import csvParse from 'csv-parse/lib/sync';

import { cryptAndUploadNFT, generateAndUploadNftJson } from '../../../../app/service/nftService'
import { uploadIPFS } from '../../../../app/service/ipfsService';
import { createNftBatch } from '../../../../app/service/nftService';
import {    readFile,
            getFileStreamFromName,
            generatePgp, 
        } from "../../../../common";
import { getSgxNodes } from "../../../../app/service/sgxService";
import { getUserFromSeed, initializeApi, safeDisconnect } from '../../../../app/service/blockchain.service';

const filePath = process.env.CSV_FILE_PATH;
const nftFolderPath = process.env.NFT_FOLDER;
const delimiter = process.env.CSV_DELIMITER || ';';
const chainEndpoint = process.env.CHAIN_ENDPOINT;
const ipfsBaseUrl = process.env.IPFS_GATEWAY_BASE_URL;
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
    title: 'NFT title',
    previewFileName: 'fileName',
    secretFileName: 'fileSecretName',
    ImagePreviewFileName: 'imagePreviewFileName',
    NFTdescription: 'NFT Description',
    quantity: 'qty',
    capsPrice: 'capsPrice',
    tiimePrice: 'tiimePrice',
    onSale: 'onSale',
    seriesId: 'seriesId',
}
if (!filePath) {
    //console.error('No CSV file given')
    process.exit()
}
if (!chainEndpoint) {
    //console.error('No chain endpoint given')
    process.exit()
}
if (!ipfsBaseUrl) {
    //console.error('No ipfs Base Url given')
    process.exit()
}
if (!shamirPath) {
    //console.error('No shamir path given')
    process.exit()
}

const processBatchNftItem = (item: any) => {
    return new Promise<void>(async (resolve, error) => {
        try {
            const {
                [csvCols.mnemonic]: Wallet,
                [csvCols.previewFileName]: fileName,
                [csvCols.secretFileName]: fileSecretName,
                [csvCols.title]: title,
                [csvCols.NFTdescription]: description,
                [csvCols.quantity]: qty,
                [csvCols.seriesId]: seriesId,

            } = item;
            const mediaFileStream = getFileStreamFromName(fileName);
            //console.log('fileName:', fileName, '--seriesId:',seriesId)
            const pgpList = [];
            const {
                mediaType: mediaType,
                size: mediaSize,
                IPFSHash: mediaIPFSHash
            } = await uploadIPFS(mediaFileStream) as any;
            let imagePreviewIPFSHash = '';
            //TODO: if(mediaType is not image type upload the ImagePreviewFileName and assing its hash)
            const secretAndExRequests = Array.from({ length: qty }).map((_v) => new Promise(async (success, reject) => {
                try {
                    const secretFileStream = getFileStreamFromName(fileSecretName) as any;
                    const pgp = await generatePgp();
                    pgpList.push(pgp);
                    const [{ IPFSHash: encryptedMediaIPFSHash, mediaType: encryptedMediaType, size: encryptedMediaSize }, { IPFSHash: publicPgpIPFSHash }] =
                        await cryptAndUploadNFT(secretFileStream, pgp.publicKey) as any;
                    console.log('cryptAndUploadNFT ok', encryptedMediaIPFSHash, encryptedMediaType, publicPgpIPFSHash);

                    const {
                        url: nftJson,
                        IPFSHash: nftIPFSHash
                    } = await generateAndUploadNftJson(title, description, imagePreviewIPFSHash, mediaIPFSHash, mediaType, mediaSize, encryptedMediaType, encryptedMediaIPFSHash, encryptedMediaSize, publicPgpIPFSHash) as any;

                    console.log('nftJson', nftJson);
                    success({
                        // media,
                        // mediaType,
                        // encryptedMedia,
                        // encryptedMediaType,
                        nftIPFSHash,
                        nftJson,
                        pgp
                    });
                } catch (e) {
                    //console.log('an error has occured', e);
                    reject(e);
                }
            }));
            const nftBatch = await Promise.all(secretAndExRequests);

            const user = await getUserFromSeed(Wallet);
            //console.log('user address', user.address);
            //console.log('seriesid', seriesId)
            const { nftsData } = await createNftBatch(nftBatch.map((nftBatchItem: any) =>nftBatchItem.nftIPFSHash), seriesId ? seriesId : null, user) as any;
            const onlyIds = nftsData.map((nft: any) => nft.nftId)
            //console.info(`successfully minted nft ${item[csvCols.title]} with ids: ${onlyIds}`);
            // const sgxResponses = await Promise.all(nftsData.map((nftData:any) => {
            //     return new Promise<void>(async (ok, ko) => {
            //         const pgpMatch = await identifyPgpKeyFromBatch(nftBatch, nftData);

            //         const sgxResponse = await saveSSSAToSGXInBatch(pgpMatch.privateKey, nftData.nftId, user).catch(e => {
            //             ko(e);
            //         });
            //         //console.info('nftID- ', nftData.nftId, ' - sgxResponse:', sgxResponse)
            //         ok(nftData.nftId);
            //     });
            // }));
            // //console.info(`successfully uploaded to sgx ${sgxResponses} - len=${sgxResponses.length}`);

            resolve();
        } catch (e) {
            error(e);
        }
    })
};

const processNftBatch = async () => {
    //console.info('Starting NFT batch...');
    const csvContent = readFile(filePath);
    const records = csvParse(csvContent, {
        skipEmptyLines: true,
        columns: true,
        delimiter
    });
    const batches: any = []
    await getSgxNodes();
    for (const item of records) {
        if (Number(item[csvCols.quantity]) > 0) {
            const batch = await processBatchNftItem(item);
            batches.push(batch);
        } else {
            //console.info(`Skipping creation for ${item['NFT Name']}: Invalid quantity given (expected > 0)`)
        }
    }
    return batches;
};

const timeLabel = `processNftBatch-${Date.now()}`;
//console.time(timeLabel)

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
}).catch((err: any) => {
    console.log('init err', err)
})