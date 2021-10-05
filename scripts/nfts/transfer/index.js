const fs = require("fs");
const {
    post
} = require("../../common");
const filePath = process.env.JSON_FILE_PATH,
    batchSize = process.env.TRANSFER_BATCH_SIZE || 100,
    mnemonic = process.env.MNEMONIC_NFTS_OWNER;
if (!filePath) {
    console.error('No JSON file given')
    process.exit()
}
if (!fs.existsSync(filePath)) {
    console.error('JSON file does not exist.')
    process.exit()
}
if (!mnemonic) {
    console.error('No seed given')
    process.exit()
}
const transferNftBatch = (items) => {
    return post('/transferNftBatch', JSON.stringify({
        nftsObject: items,
        mnemonic
    }), {
        headers: {
            "Content-Type": "application/json"
        },
    });
}
const transferNFT = async () => {
    console.info('transferNFT...');
    const jsonFileContent = fs.readFileSync(filePath);
    const transfersList = JSON.parse(jsonFileContent);
    const chunkSize = Math.ceil(Object.keys(transfersList).length / batchSize);
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
};
const timeLabel = `transferNftBatch-${Date.now()}`;
console.time(timeLabel)
transferNFT()
    .catch(e => {
        console.error('Error caught:' + e);
    })
    .finally(() => {
        console.info('process finished');
        console.timeEnd(timeLabel)
        process.exit();
    });