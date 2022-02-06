const fs = require("fs");
const csvParse = require('csv-parse/lib/sync')
const fetch = require('node-fetch');
const FormData = require('form-data');
const filePath = process.env.CSV_FILE_PATH;
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000/api";
const batchSize = process.env.TRANSFER_BATCH_SIZE || 100
const delimiter = process.env.CSV_DELIMITER || ';';
const defaultMarketplaceId = 1;
const csvCols = {
    mnemonic: 'Wallet',
    capsPrice: 'capsPrice',
    tiimePrice: 'tiimePrice',
    marketplaceId: 'marketplaceId',
}
if (!filePath) {
    console.error('No CSV file given')
    process.exit()
}
const readFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath)
    } else {
        throw new Error(`File not found at ${filePath}`)
    }
}
const processBatchListRequest = () => {
    const nftList = nftDataList.map(({
        item,
        secret,
        url
    }) => {
        return {
            nftUrl: url,
            mnemonic,
            capsPrice: item.capsPrice,
            tiimePrice: item.tiimePrice,
            cryptedMedia: secret,
            itemTotal,
            filename: item.fileSecretName,
            onSale: item.onSale,
        }
    })
    return post('/processNFTBatch', JSON.stringify({
        nftList,
        mnemonic,
        itemTotal,
    }), {
        headers: {
            "Content-Type": "application/json"
        },
    })
}
const processNft = (nftUrl, item, secret) => {
    const {
        [csvCols.mnemonic]: Wallet,
        [csvCols.capsPrice]: capsPrice,
        [csvCols.tiimePrice]: tiimePrice,
        [csvCols.quantity]: qty,
        [csvCols.secretFileName]: fileSecretName,
        [csvCols.onSale]: onSale,
    } = item;
    return post('/processNFT', JSON.stringify({
        nftUrl,
        mnemonic: Wallet,
        capsPrice,
        tiimePrice,
        cryptedMedia: secret,
        itemTotal: qty,
        filename: fileSecretName,
        onSale,
    }), {
        headers: {
            "Content-Type": "application/json"
        },
    })
}
const processNftItem = async (item) => {
    const {
        [csvCols.previewFileName]: fileName,
        [csvCols.secretFileName]: fileSecretName,
        [csvCols.quantity]: qty,
    } = item;
    const media = await uploadImRequest(fileName);
    const secretAndExRequests = Array.from({
        length: qty
    }).map((_v, i) => new Promise(async (success, reject) => {
        try {
            const secret = await cryptFileRequest(fileSecretName, item);
            const nftData = await uploadExRequest(item, secret, media);
            const {
                nftId
            } = await processNft(nftData.url, item, secret);
            console.info(`NFT Id created: ${nftId}`)
            success(nftId, media, secret);
        } catch (e) {
            reject(e);
        }
    }));
    return Promise.all(secretAndExRequests).then((_nftBatch) => {
        console.info(`successfully uploaded nft ${item['NFT Name']}`)
    }).catch(e => {
        console.error(`An error has occured on nft creation : ${item['NFT Name']} - error: ${e}`)
    });
};

const processBatchNftItem = (item) => {
    return new Promise(async (resolve, error) => {
        try {
            const {
                [csvCols.previewFileName]: fileName,
                [csvCols.secretFileName]: fileSecretName,
                [csvCols.quantity]: qty,
                [csvCols.mnemonic]: Wallet,
            } = item;
            const media = await uploadImRequest(fileName);
            const secretAndExRequests = Array.from({
                length: qty
            }).map((_v, i) => new Promise(async (success, reject) => {
                try {
                    const secret = await cryptFileRequest(fileSecretName, item);
                    const nftData = await uploadExRequest(item, secret, media);
                    success({
                        media,
                        secret,
                        nftData
                    });
                } catch (e) {
                    reject(e);
                }
            }));
            const nftBatch = await Promise.all(secretAndExRequests);
            const nftDataList = [];
            for (const {
                    secret,
                    nftData
                } of nftBatch) {
                nftDataList.push({
                    url: nftData.url,
                    item,
                    secret
                })
            }
            const {
                nftIds
            } = await processBatchNfRequest(nftDataList, Wallet, qty);
            console.info(`successfully uploaded nft ${item['NFT Name']} with ids: ${nftIds}`);
            resolve(nftIds);
        } catch (e) {
            error(e);
        }
    })
};

const processListBatch = async () => {
    console.info('Starting List batch...');
    const csvContent = readFile(filePath);
    const records = csvParse(csvContent, {
        skipEmptyLines: true,
        columns: true,
        delimiter
    });
    const batches = []

    const chunkSize = Math.ceil(records.length / batchSize);
    const transferedNfts = []
    for (let chunkIndex = 0; chunkIndex < chunkSize; chunkIndex++) {
        const keys = Object.keys(transfersList).filter((v, i) => i >= (chunkIndex * batchSize) && i < ((chunkIndex + 1) * batchSize));
        const items = {}
        keys.map(key => {
            items[key] = transfersList[key]
        })
        const response = await transferNftBatch(items);
        const nftIds = response.nftIds ||  null;
        transferedNfts.push(...(nftIds||[]))
        console.info(`Batch transfer done for nft ids: ${nftIds} - count = ${(nftIds || []).length}`);
    }
    console.info(`Script transfer done for nft ids: ${transferedNfts} - total count = ${transferedNfts.length}`);
        for (const item of records) {
        if (Number(item.qty) > 0) {
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
processListBatch()
    .catch(e => {
        console.error('Error caught:' + e);
    })
    .finally(() => {
        console.info('process finished');
        console.timeEnd(timeLabel)
        process.exit();
    });