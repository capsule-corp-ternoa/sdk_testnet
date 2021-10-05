const fs = require("fs");
const csvParse = require('csv-parse/lib/sync')
const {
    uploadIPFS,
    cryptAndUploadNFT,
    generatePgp,
    generateAndUploadNftJson,
    getFileHash,
    generateSeriesId
} = require("../../../common/nft-encrypt");
const {} = require("../../../common");
const {
    createNftBatch,
    getUserFromSeed,
    initializeApi,
    safeDisconnect,
} = require("../../../common/chain");
const {
    getSgxNodeApi,
    getSgxNodes
} = require("../../../sgx");
const {
    sssaGenerate,
    SSSA_THRESHOLD
} = require("../../../sssa");
const filePath = process.env.CSV_FILE_PATH;
const nftFolderPath = process.env.NFT_FOLDER;
const delimiter = process.env.CSV_DELIMITER || ';';
const chainEndpoint = process.env.CHAIN_ENDPOINT;
const ipfsBaseUrl = process.env.IPFS_BASEURL;
const shamirPath = process.env.SHAMIR_PATH;
console.log('starting batch script with parameters');
console.log('filePath:' + filePath);
console.log('nftFolderPath:' + nftFolderPath);
console.log('delimiter:' + delimiter);
console.log('chainEndpoint:' + chainEndpoint);
console.log('ipfsBaseUrl:' + ipfsBaseUrl);
console.log('shamirPath:' + shamirPath);

const csvCols = {
    mnemonic: 'Wallet',
    address: 'Address',
    artist: 'Artist',
    nftName: 'NFT Name',
    previewFileName: 'fileName',
    secretFileName: 'fileSecretName',
    NFtdescription: 'NFT Description',
    nftType: 'NFT Type',
    notes: 'Notes',
    URL: 'URL',
    quantity: 'qty',
    capsPrice: 'capsPrice',
    tiimePrice: 'tiimePrice',
    onSale: 'onSale',
    fileHash: 'fileHash',
}
if (!filePath) {
    console.error('No CSV file given')
    process.exit()
}
if (!chainEndpoint) {
    console.error('No chain endpoint given')
    process.exit()
}
if (!ipfsBaseUrl) {
    console.error('No ipfs Base Url given')
    process.exit()
}
if (!shamirPath) {
    console.error('No shamir path given')
    process.exit()
}
const readFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath)
    } else {
        throw new Error(`File not found at ${filePath}`)
    }
}
const getFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        return fs.createReadStream(filePath)
    } else {
        throw new Error(`File not found at ${filePath}`)
    }
}
const getFilePath = (fileName) => `${nftFolderPath}/${fileName}`;
const getFileStreamFromName = (fileName) => getFile(getFilePath(fileName));
const identifyPgpKeyFromBatch = async (batchArray, nftData) => {
    const offchain_uri = nftData.offchain_uri
    const batchItem = batchArray.find((nft) => nft.nftJson === offchain_uri);
    return batchItem.pgp;
}
const onShamirFailed = (error) => {
    try {
        const {
            message,
            data,
            nftId,
            sgxApiUrl
        } = error;
        if (nftId && data && sgxApiUrl) {
            const sgxNodeUrlBuffer = Buffer.from(sgxApiUrl);
            const sgxNodeUrlEncoded = sgxNodeUrlBuffer.toString('base64')
            const dirPath = `${shamirPath}/${sgxNodeUrlEncoded}`;
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }
            fs.writeFile(`${dirPath}/${nftId}`, data, () => {
                console.info(`shamir locally saved to ${dirPath}/${nftId}`);
            });
        } else {
            console.error('Can\'t store shamir locally due to missing info.')
        }
    } catch (e) {
        console.error('Missing data - e:' + e);
        throw new Error('Shamir local save failed');
    }
}
const saveSSSAToSGX = async (privateKey, nftId, sender) => {
    const pubKey = sender.address;
    const sssaShares = sssaGenerate(privateKey);
    const sgxResponses = await Promise.all(
        sssaShares.map(async (sssaShare, index) => {
            return new Promise(async (resolve, reject) => {
                const sgxNodeApi = await getSgxNodeApi(index);
                sgxNodeApi.saveShamir(sssaShare, nftId, pubKey, sender).catch((e) => {
                    reject(e);
                    onShamirFailed(e);
                }).then(resolve);
            });
        }));
    const validSgxResponses = sgxResponses.filter(result => !(result instanceof Error));
    console.log('valid SGX requests:' + validSgxResponses.length)
    if (validSgxResponses.length >= SSSA_THRESHOLD) {
        return sgxResponses;
    } else {
        throw new Error('Not enough shamirs were saved to SGX Nodes');
    }
};
const processBatchNftItem = (item) => {
    return new Promise(async (resolve, error) => {
        try {
            const {
                [csvCols.previewFileName]: fileName,
                [csvCols.secretFileName]: fileSecretName,
                [csvCols.quantity]: qty,
                [csvCols.mnemonic]: Wallet,
                [csvCols.nftName]: name,
                [csvCols.NFtdescription]: description,
            } = item;
            const mediaFileStream = getFileStreamFromName(fileName);
            let seriesId;
            const pgpList = [];
            const {
                url: media,
                mediaType
            } = await uploadIPFS(mediaFileStream);
            const secretAndExRequests = Array.from({
                length: qty
            }).map((_v) => new Promise(async (success, reject) => {
                try {
                    const secretFileStream = getFileStreamFromName(fileSecretName);
                    const pgp = await generatePgp();
                    pgpList.push(pgp);
                    const [{
                        url: encryptedMedia,
                        mediaType: encryptedMediaType
                    }, {
                        url: publicPgpLink
                    }] = await cryptAndUploadNFT(secretFileStream, pgp.publicKey);
                    console.log('cryptAndUploadNFT ok', encryptedMedia, encryptedMediaType, publicPgpLink);
                    const fileHash = await getFileHash(secretFileStream);
                    seriesId = generateSeriesId(fileHash)
                    console.log('seriesId ok', seriesId);
                    const {
                        url: nftJson
                    } = await generateAndUploadNftJson(name, description, seriesId, media, mediaType, encryptedMedia, encryptedMediaType, publicPgpLink);

                    console.log('nftJson', nftJson);
                    success({
                        media,
                        mediaType,
                        encryptedMedia,
                        encryptedMediaType,
                        nftJson,
                        pgp
                    });
                } catch (e) {
                    console.log('an error has occured', e);
                    reject(e);
                }
            }));
            const nftBatch = await Promise.all(secretAndExRequests);
            const user = getUserFromSeed(Wallet);
            console.log('user address', user.address);
            const {
                nftsData
            } = await createNftBatch(nftBatch.map(nftBatchItem => nftBatchItem.nftJson), seriesId, user);
            const onlyIds = nftsData.map(nft => nft.nftId)
            console.info(`successfully uploaded nft ${item[csvCols.nftName]} with ids: ${onlyIds}`);
            const sgxResponses = await Promise.all(nftsData.map(nftData => {
                return new Promise(async (ok, ko) => {
                    const pgpMatch = await identifyPgpKeyFromBatch(nftBatch, nftData);
                    const sgxResponse = await saveSSSAToSGX(pgpMatch.privateKey, nftData.nftId, user).catch(e => {
                        ko(e);
                    });
                    console.info('nftID- ', nftData.nftId, ' - sgxResponse:', sgxResponse)
                    ok(nftData.nftId);
                });
            }));
            console.info(`successfully uploaded to sgx ${sgxResponses} - len=${sgxResponses.length}`);
            resolve()
        } catch (e) {
            error(e);
        }
    })
};

const processNftBatch = async () => {
    console.info('Starting NFT batch...');
    const csvContent = readFile(filePath);
    const records = csvParse(csvContent, {
        skipEmptyLines: true,
        columns: true,
        delimiter
    });
    const batches = []
    await getSgxNodes();
    for (const item of records) {
        if (Number(item[csvCols.quantity]) > 0) {
            const batch = await processBatchNftItem(item);
            batches.push(batch);
        } else {
            console.info(`Skipping creation for ${item['NFT Name']}: Invalid quantity given (expected > 0)`)
        }
    }
    return batches;
};
const timeLabel = `processNftBatch-${Date.now()}`;
console.time(timeLabel) 
initializeApi().then(() => {
    processNftBatch()
        .catch(e => {
            console.error('Error caught:' + e);
        })
        .finally(() => {
            console.info('process finished');
            console.timeEnd(timeLabel)
            safeDisconnect();
            process.exit();
        });
});