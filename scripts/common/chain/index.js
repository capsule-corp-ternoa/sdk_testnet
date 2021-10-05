const {
    ApiPromise,
    WsProvider
} = require('@polkadot/api');
const {
    cryptoWaitReady,
} = require('@polkadot/util-crypto');
const {
    Keyring
} = require('@polkadot/keyring');
const {
    spec
} = require('../../../app/types');
const {
    u8aToHex,
    hexToString
} = require('@polkadot/util')

const keyring = new Keyring({
    type: 'sr25519'
})
let api = null;
const CHAIN_ENDPOINT = process.env.CHAIN_ENDPOINT;
const initializeApi = async () => {
    await cryptoWaitReady();
    const wsProvider = new WsProvider(CHAIN_ENDPOINT);
    api = await ApiPromise.create({
        provider: wsProvider,
        types: spec
    });
    return api;
}
exports.initializeApi = initializeApi;
const getApi = async () => {
    if (!api || !api.isConnected) {
        console.log('creating chain api')
        api = await initializeApi();
    } 
    return api;
}
const safeDisconnect = () => {
    if (api && api.isConnected) {
        api.disconnect();
    }
}
exports.safeDisconnect = safeDisconnect;
const formatChainData = (data)=> JSON.parse(JSON.stringify(data));
const createNftTransaction = async (chainNft) => ((await getApi()).tx.nfts.create(chainNft));
exports.createNftBatch = (jsonNftBatch, seriesId, user, isCapsule = false) => {
    return new Promise(async (resolve, reject) => {
        const chainNftBatch = jsonNftBatch.map(jsonNftItemUrl => ({
            offchain_uri: jsonNftItemUrl,
            series_id: seriesId || 0,
            is_capsule: isCapsule
        }));
        const nftTransactions = await Promise.all(chainNftBatch.map(chainNftItem => createNftTransaction(chainNftItem)));
        const nftsDataList = [];
        const unsub = await ((await getApi()).tx.utility.batch(nftTransactions)).signAndSend(user, ({
            events = [],
            status
        }) => {
            if (status.isInBlock) {
                events.forEach(async ({
                    event
                }) => {
                    const {
                        data,
                        method,
                        section
                    } = event;
                    if (`${section}.${method}` === 'nfts.Created') {
                        const nftId = data[0].toString();
                        const offchain_uri = Buffer.from(data[3], 'hex').toString('utf8');
                        nftsDataList.push({ nftId, offchain_uri });
                    } else if (`${section}.${method}` === 'utility.BatchInterrupted') {
                        const errorDetails = data[1].toString();
                        reject(`Could not create the NFT in blockchain: details: ${errorDetails}`);
                        unsub();
                    } else if (`${section}.${method}` === 'utility.BatchCompleted') {
                        resolve({
                            nftsData: nftsDataList
                        });
                        unsub();
                    }
                });
            }
        });
    })
};
exports.getNftData = async (nftId) => {
    console.log('getNftData');
    const nftData = (await getApi()).query.nfts.data(nftId);
    return nftData;
};
exports.getUserFromSeed = (seed) => keyring.addFromMnemonic(seed);
exports.getSignature = (sender, data) => u8aToHex(sender.sign(data));
exports.getSgxNodes = async () => {
    const sgxList = await (await getApi()).query.sgx.enclaveRegistry.entries();
    return sgxList.map((sgxItem) => {
        return {
        id: Number(sgxItem[0].args),
        url: hexToString(formatChainData(sgxItem[1].value).api_url),
      };
    });
  };