const {
    httpPost,
    httpGet
} = require('../common');
const {
    getSignature
} = require('../common/chain');
const axios = require('axios');

const {
    cryptData
} = require('../common/nft-encrypt');
const chain = require('../common/chain');
let chainSgxNodes;
const getSgxNodes = async () => {
    if (!chainSgxNodes) {
        chainSgxNodes = await chain.getSgxNodes();
        console.log('chainSgxNodes', chainSgxNodes);
    }
    return chainSgxNodes;
}
let serverPGPKeys = {}
const sgxApi = async (nodeUrl) => {
    const _baseUrl = `${nodeUrl}/api`;
    const sgxNodeBaseUrlList = (await getSgxNodes()).map(sgxNode => sgxNode.url);
    return {
        _baseUrl,
        sgxNodeBaseUrlList,
        saveShamir: async (sssaShare, nftId, accountPubKey, sender) => {
            const data = `${nftId}_${accountPubKey}_${sssaShare}`,
                signature = getSignature(sender, data);
            const sgxData = JSON.stringify({
                data,
                signature
            })
            try {
                let serverPGPKey = null;
                if (serverPGPKeys[_baseUrl]) {
                    serverPGPKey = serverPGPKeys[_baseUrl]
                } else {
                    const serverPGPKeyRes = await httpGet(`${_baseUrl}/keys/getpublickey`)
                    if (serverPGPKeyRes) {
                        serverPGPKey = serverPGPKeyRes;
                        serverPGPKeys[_baseUrl] = serverPGPKeyRes
                    }
                }
                if (!serverPGPKey)
                    throw new Error('server pgp key not found for', _baseUrl);
                const encryptedSGXData = await cryptData(sgxData, serverPGPKey)
                const res = await axios.post(`${_baseUrl}/nft/saveShamir`, {
                    sgxData: encryptedSGXData
                })
                return res.data || null;
            } catch (e) {
                console.error('saveShamir error:', JSON.stringify(e));
                throw {
                    message: 'Save Shamir error:' + e.toString(),
                    data: sgxData,
                    nftId,
                    sgxApiUrl: nodeUrl
                };
            }
        },
        getShamir: async (nftId, accountPubKey, sender) => {
            const data = `${nftId}_${accountPubKey}_${'getData'}`,
                signature = getSignature(sender, data);
            const res = await httpPost(`${_baseUrl}/getShamir`, JSON.stringify({
                data,
                signature
            }), {
                headers: {
                    "Content-Type": "application/json"
                },
            });
            console.log('getShamir res', res);
            return res && res.data.shamir || null;
        },
    };
};
exports.getSgxNodes = getSgxNodes;
exports.getSgxNodeApi = async (index) => {
    const chainSgxNodes = await getSgxNodes();
    return await sgxApi(chainSgxNodes[index % chainSgxNodes.length].url);
};