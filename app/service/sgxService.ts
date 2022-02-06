import * as fs from 'fs';
import axios from 'axios';
import {
    generatePgp,
    httpGet,
    httpPost
} from '../../common';
import { cryptData } from '../service/nftService';
import { sssaGenerate, SSSA_THRESHOLD } from '../../scripts/sssa';
import { v4 as uuid } from 'uuid';
import { getSignature, getSgxNodes as getChainSgxNodes } from './blockchain.service';
import { combineSSSAShares } from '../helpers/sssa.helper';
import * as openpgp from 'openpgp';
let chainSgxNodes: any;
export const getSgxNodes = async () => {
    if (!chainSgxNodes) {
        chainSgxNodes = await getChainSgxNodes();
    }
    return chainSgxNodes;
}

let serverPGPKeys = {}
export const sgxApi = async (nodeUrl: string) => {
    const _baseUrl = `${nodeUrl}/api` as string;

    const sgxNodeBaseUrlList = (await getSgxNodes()).map((sgxNode: any) => sgxNode.url);
    return {
        _baseUrl,
        sgxNodeBaseUrlList,

        saveShamir: async (sssaShare: string, nftId: string, accountPubKey: string, sender: string) => {
            //console.log('saveShamir', sssaShare, nftId, accountPubKey, sender);
            const data = `${nftId}_${accountPubKey}_${sssaShare}`,
                signature = getSignature(sender, data);
            const sgxData = JSON.stringify({
                data,
                signature
            })
            try {
                let serverPGPKey = null as any;

                if ((serverPGPKeys as any)[_baseUrl]) {

                    serverPGPKey = (serverPGPKeys as any)[_baseUrl]
                } else {
                    const serverPGPKeyRes = await httpGet(`${_baseUrl}/keys/getpublickey`)
                    if (serverPGPKeyRes) {
                        serverPGPKey = serverPGPKeyRes;

                        (serverPGPKeys as any)[_baseUrl] = serverPGPKeyRes
                    }
                }
                if (!serverPGPKey)

                    throw new Error('server pgp key not found for' + _baseUrl);
                const encryptedSGXData = await cryptData(sgxData, serverPGPKey)
                const res = await axios.post(`${_baseUrl}/nft/saveShamir`, {
                    sgxData: encryptedSGXData
                })
                return res.data || null;
            } catch (e: any) {
                //console.error('saveShamir error:', JSON.stringify(e));
                throw {

                    message: 'Save Shamir error:' + e.toString(),
                    data: sgxData,
                    nftId,
                    sgxApiUrl: nodeUrl
                };
            }
        },
        saveShamirInBatch: async (sssaShareData: any, sender: any) => {
            const data = JSON.stringify({
                accountPubKey: sender.address,
                sssaShareData
            })
            const signature = getSignature(sender, data);
            const sgxData = JSON.stringify({
                data,
                signature
            })
            // //console.log('sgxData', sgxData)

            try {
                let serverPGPKey = null;
                if ((serverPGPKeys as any)[_baseUrl]) {
                    serverPGPKey = (serverPGPKeys as any)[_baseUrl]
                } else {
                    const serverPGPKeyRes = await httpGet(`${_baseUrl}/keys/getpublickey`)
                    if (serverPGPKeyRes) {
                        serverPGPKey = serverPGPKeyRes;
                        (serverPGPKeys as any)[_baseUrl] = serverPGPKeyRes
                    }
                }
                if (!serverPGPKey)
                    throw new Error('server pgp key not found for' + _baseUrl);
                const encryptedSGXData = await cryptData(sgxData, serverPGPKey)
                const res = await axios.post(`${_baseUrl}/nft/saveShamirBatch`, {
                    sgxData: encryptedSGXData
                })
                return res.data || null;
            } catch (e: any) {
                //console.error('saveShamir error:', JSON.stringify(e));
                throw {
                    message: 'Save Shamir error:' + e.toString(),
                    data: sgxData,
                    sgxApiUrl: nodeUrl
                };
            }
        },
        getShamir: async (nftId: number, accountPubKey: string, sender: string) => {

            const data = `${nftId}_${accountPubKey}_${'getData'}`,
                signature = getSignature(sender, data);
            const headers = {
                "Content-Type": "application/json"
            }
            const requestOptions = {
                headers
            };
            console.log('getShamir', nftId, accountPubKey, sender);
            const pgp = await generatePgp();


            const res = await httpPost(`${_baseUrl}/nft/getShamir`, JSON.stringify({ data, signature, key: pgp.publicKey }), requestOptions as any).catch((e) => {
                console.error('error on getShamir', e);
            });
            if (res && (res as any).encryptedShamir) {
                const encryptedShamir = (res as any).encryptedShamir;
                console.log('encryptedShamir', encryptedShamir);
                const pgpPrivateKey: openpgp.PrivateKey = await openpgp.readPrivateKey({ armoredKey: pgp.privateKey as string });
                const pgpMsg = await openpgp.readMessage({ armoredMessage: encryptedShamir });
                const pgpResult = await openpgp.decrypt({ message: pgpMsg, decryptionKeys: pgpPrivateKey });
                const sssaShare = pgpResult.data;
                console.log('sssaShare', sssaShare);
                return sssaShare;
            } else {
                return null;
            }
        },
    };
};
export const getSgxNodeApi = async (index: number) => {
    const chainSgxNodes = await getSgxNodes();
    return await sgxApi(chainSgxNodes[index % chainSgxNodes.length].url);
};
export const getSgxNodeApiInstanceById = async (nodeId: string, nodes: any) => {
    const node = nodes.find((node: any) => node.id == nodeId);
    return await sgxApi(node.url);
};

const shamirPath = process.env.SHAMIR_PATH || './faildShamirs';

const onShamirFailed = (error: any) => {
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
                //console.info(`shamir locally saved to ${dirPath}/${nftId}`);
            });
        } else {
            //console.error('Can\'t store shamir locally due to missing info.')
        }
    } catch (e) {
        //console.error('Missing data - e:' + e);
        throw new Error('Shamir local save failed');
    }
}
export const saveSSSAToSGX = async (privateKey: string, nftId: string, sender: any) => {
    const pubKey = sender.address;
    const sssaShares = sssaGenerate(privateKey);

    const sgxResponses = await Promise.all(

        sssaShares.map(async (sssaShare: any, index: number) => {
            return new Promise(async (resolve, reject) => {
                const sgxNodeApi = await getSgxNodeApi(index);
                sgxNodeApi.saveShamir(sssaShare, nftId, pubKey, sender).catch((e: any) => {
                    reject(e);
                    onShamirFailed(e);
                }).then(resolve);
            });
        }));
    const validSgxResponses = sgxResponses.filter(result => !(result instanceof Error));
    ////console.log('valid SGX requests:' + validSgxResponses.length)
    if (validSgxResponses.length >= SSSA_THRESHOLD) {
        return sgxResponses;
    } else {
        throw new Error('Not enough shamirs were saved to SGX Nodes');
    }
};
const onShamirBatchFailed = (error: any) => {
    try {
        const {
            message,
            data,
            sgxApiUrl
        } = error;
        if (data && sgxApiUrl) {
            const sgxNodeUrlBuffer = Buffer.from(sgxApiUrl);
            const sgxNodeUrlEncoded = sgxNodeUrlBuffer.toString('base64')
            const dirPath = `${shamirPath}/${sgxNodeUrlEncoded}`;
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }
            fs.writeFileSync(`${dirPath}/${uuid()}`, data)
            //console.info(`shamir data locally saved to${dirPath}/${uuid()}`);
        } else {
            //console.error('Can\'t store shamir locally due to missing info.')
        }
    } catch (e) {
        //console.error('Missing data - e:' + e);
        throw new Error('Shamir local save failed');
    }
}
export const saveSSSAToSGXInBatch = async (nftSgxData: any, sender: any) => {
    const sgxNodes = await getSgxNodes();
    //nodes and shares are equal in length always
    let sssaShareDataForAllNodes: any = {}
    for (let i = 0; i < nftSgxData.length; i++) {
        const nftId = nftSgxData[i].nftId
        const sssaShares = sssaGenerate(nftSgxData[i].privateKey);
        // //console.log('nftid', nftId, '--sssaShares', sssaShares)
        for (let j = 0; j < sgxNodes.length; j++) {
            if (sssaShareDataForAllNodes[sgxNodes[j].id]) {
                sssaShareDataForAllNodes[sgxNodes[j].id] = {
                    ...sssaShareDataForAllNodes[sgxNodes[j].id],
                    [nftId]: sssaShares[j]
                };
            } else {
                sssaShareDataForAllNodes[sgxNodes[j].id] = {
                    [nftId]: sssaShares[j]
                }
            }
        }
    }

    // //console.log('sssaShareDataForAllNodes', sssaShareDataForAllNodes)

    const _nodeIds = Object.keys(sssaShareDataForAllNodes)

    const sgxResponses = await Promise.all(
        _nodeIds.map(async (nodeId: string) => {
            return new Promise(async (resolve, reject) => {
                const sgxNodeApi = await getSgxNodeApiInstanceById(nodeId, sgxNodes);
                sgxNodeApi.saveShamirInBatch(sssaShareDataForAllNodes[nodeId], sender).catch((e) => {
                    reject(e);
                    onShamirBatchFailed(e);
                }).then(resolve);
            });
        }));
    //console.log('sgxResponses', sgxResponses)
    return sgxResponses
    //TODO: onShamirFailed if request fails, then save all data for that node, if some are in failed, that can only happne if either use did something invalid or write failed
    // but validate above theory from sgx code please

    // const validSgxResponses = sgxResponses.filter(result => !(result instanceof Error));
    // //console.log('valid SGX requests:' + validSgxResponses.length)
    // if (validSgxResponses.length >= SSSA_THRESHOLD) {
    //     return sgxResponses;
    // } else {
    //     throw new Error('Not enough shamirs were saved to SGX Nodes');
    // }
};
export const getPgpPrivateKeyFromSgxNodes = async (nftId: number, sender: any): Promise<string> => {
    const pubKey = sender.address;
    await getSgxNodes();
    const sgxResponses = await Promise.all(
        chainSgxNodes.map((_sgxNode: any, index: number) => {
            return new Promise(async (resolve, reject) => {
                const sgxNodeApi = await getSgxNodeApi(index);
                sgxNodeApi.getShamir(nftId, pubKey, sender).catch((e: any) => {
                    reject(e);
                    console.log('error getShamir', e);
                }).then(resolve);
            });
        }));
    console.log('sgxResponses', sgxResponses);;
    const validSgxResponses = sgxResponses.filter(sssaShare => sssaShare && typeof sssaShare == 'string');
    console.log('valid SGX requests:' + validSgxResponses.length)
    if (validSgxResponses.length >= SSSA_THRESHOLD) {
        const privatePgpKey = combineSSSAShares(validSgxResponses as string[]);
        return privatePgpKey;
    } else {
        throw new Error('Not enough shamirs were retrieved from SGX Nodes');
    }
};