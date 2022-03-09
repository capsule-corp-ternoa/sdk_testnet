import * as openpgp from 'openpgp';
import { v4 as uuid } from 'uuid';
import axios from 'axios';
import { uploadIPFS } from '../service/ipfsService';
import * as fs from 'fs';
import { UploadedFile } from 'express-fileupload';
import { hexToU8a, isHex, BN_TEN, u8aToHex } from '@polkadot/util';
import _ from 'lodash';
import FormData from 'form-data';
import { uploadImService} from '../service/ipfsService';
import {
    contentToStream,
    deleteFile,
    getStreamFilename,
    cryptFilePgp,
    getFilePath,
    generatePgp,
    getFileStreamFromName,
} from '../../common';

import {
    getNftById, getNftsByIds
} from '../service/ternoa.indexer';
import { getApi, getChainPrice, getUserFromSeed, runTransaction, unFormatBalance } from './blockchain.service';
import { txActions, txEvent, txPallets } from '../const/tx.const';
import { getPgpPrivateKeyFromSgxNodes } from './sgxService';
import { decryptNft } from '../controllers/nftController';

const localKeysFolder = process.env.LOCAL_KEYS_FOLDER || './nftKeys/';
const CHAIN_ENDPOINT = process.env.CHAIN_ENDPOINT;


export const cryptAndUploadNFT = async (secretNFT: string, publicPGP: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            //NFT Data
            const encryptedSecretNft = await cryptFilePgp(secretNFT, publicPGP);
            const secretFileName = getStreamFilename(secretNFT);

            const pgpPath = `./tmp/pgp-public-key_${uuid()}.txt`;
            const pgpFile = contentToStream(publicPGP, pgpPath);
            const encryptedPath = `./tmp/${uuid()}_${secretFileName}`;
            const encryptedFile = contentToStream(encryptedSecretNft, encryptedPath);
            const [encryptedUploadResponse, pgpUploadResponse] = await Promise.all([
                uploadIPFS(encryptedFile),
                uploadIPFS(pgpFile),
            ])
            deleteFile(encryptedPath)
            deleteFile(pgpPath)
            resolve([encryptedUploadResponse, pgpUploadResponse])
        } catch (err) {
            reject(err)
        }
    })
}

export const cryptData = async (data: any, publicPGP: string) => {
    const message = await openpgp.createMessage({
        text: data
    });
    const publicKey = await openpgp.readKey({
        armoredKey: publicPGP
    })
    const encrypted = await openpgp.encrypt({
        message,
        encryptionKeys: [publicKey],
    });
    return encrypted
}

export const createNftTransaction = async (nftIPFSHash: string, seriesId: string) => ((await getApi()).tx.nfts.create(nftIPFSHash, seriesId ? seriesId : null));
export const createNftBatch =async (jsonNftBatch: any, seriesId: string, user: any) => {
    try{
        console.log(jsonNftBatch);
        const nftTransactions = await Promise.all(jsonNftBatch.map((jsonNftbatch: string) => {
            console.log(jsonNftBatch)
            createNftTransaction(jsonNftbatch,seriesId)}));
        const { event, data } = await runTransaction(txPallets.utility, txActions.batch, user, [nftTransactions], false, txEvent.nftsCreated)
        const nft_Id =  data[0].toString();
        return nft_Id;
    }
    catch(err){
        return err
    }
   /* return new Promise(async (resolve, reject) => {
        const nftTransactions = await Promise.all(jsonNftBatch.map((jsonNftItemHash: any) => createNftTransaction(jsonNftItemHash, seriesId)));
        const nftsDataList: any = [];
        const unsub = await ((await getApi()).tx.utility.batch(nftTransactions)).signAndSend(user, ({
            events = [],
            status = { isInBlock: false }
        }) => {
            if (status.isInBlock) {
                console.log("hello I'm in block")
                events.forEach(async ({
                    event
                }) => {
                    const {
                        data,
                        method,
                        section
                    } = event;
                    console.log("Section.method:",`${section}.${method}`)
                    if (`${section}.${method}` === 'nfts.Created') {
                        const nftId = <string>data[0];
                        const nftIpfs = Buffer.from(data[3], 'hex').toString('utf8');
                        nftsDataList.push({ nftId, nftIpfs });
                    } else if (`${section}.${method}` === 'utility.BatchInterrupted') {
                        const errorDetails = <string>data[1];
                        unsub();
                        reject(`Could not create the NFT in blockchain: details: ${errorDetails}`);
                    } else if (`${section}.${method}` === 'utility.BatchCompleted') {
                        unsub();
                        resolve({
                            nftsData: nftsDataList
                        });
                    }
                });
            }
        });
    })*/
};

export const getNftDatafromIpfs = async (ipfs: string) => {
    const url = `${process.env.IPFS_GATEWAY_BASE_URL}/ipfs/${ipfs}`;
    const data = axios.get(url)
        .then(response => {
            return response.data
        })
        .catch(error => {
            //console.log(error);
        })
    return data
}
export const getNftPublicKey = async (ipfs: string) => {
    const url = `${process.env.IPFS_GATEWAY_BASE_URL}/ipfs/${ipfs}`;
    const data = axios.get(url)
        .then(response => { return response.data })
        .catch(error => {
            return false
        })
    return data
}
export const createNft = async (nftIpfs: string, seriesId: string, user: any) => {
    try{
        const { event, data } = await runTransaction(txPallets.nfts, txActions.create, user, [nftIpfs, seriesId ? seriesId : null], false, txEvent.nftsCreated)
        const nftId = data[0].toString();
        return nftId;
    }
    catch(err){
        console.log('createNft err:::', err)
        throw err
    }
};

export const burnNftTransaction = async (nftId: string) => ((await getApi()).tx.nfts.burn(nftId));
export const burnNftsBatchService =async (nftIds: any, user: any) => {
    try{
        const nftTransactions = await Promise.all(nftIds.map((nftId: string) => burnNftTransaction(nftId)));
        const { event, data } = await runTransaction(txPallets.utility, txActions.batch, user, [nftTransactions], false, txEvent.nftsBurned)
        const nft_Id =  data[0].toString();
        return nft_Id;
    }
    catch(err){
        return err
    }
};

export const burnNftService = async (nftId: any, user: any) => {
    const From = await getUserFromSeed('million size name hair stone oyster figure blade regular dynamic seven syrup');
    const api = await getApi();
    const To = '5H4Hu12N7PUFUv3y8Cm41N7K71Azk4mbjjGWzKPtJi7Juz6j'

    // const account = await api.query.system.account(From.address)
    // const nonce = account.nonce
    const nonce = await api.rpc.system.accountNextIndex(From.address)

    // console.log('account', account);
    // console.log('nonce', nonce);
    console.log('From address', From.address)

    const signedBlock = await api.rpc.chain.getBlock();
    const currentHeight = signedBlock.block.header.number;
    const era = api.createType('ExtrinsicEra', { current: currentHeight, period: 10 });
    const blockHash = signedBlock.block.header.hash;
    const genesisHash = api.genesisHash;
    const specVersion = api.runtimeVersion.specVersion;



const tx = api.tx.balances.transfer(To, unFormatBalance(27));

// let payload = api.createType('ExtrinsicPayload', {
//     blockHash: blockHash.toHex(),
//     era: era.toHex(),
//     genesisHash: genesisHash.toHex(),
//     method: tx.toHex(),
//     nonce: nonce.toHex(),
//     specVersion: specVersion.toHex(),
// }, { version : api.extrinsicVersion} );
// console.log('payload:::', payload)

// // console.log('payload payload:::', signableData.toPayload())
// console.log('payload json:::',JSON.stringify(payload))
// const signature = From.sign(payload.toU8a(true));
// const sigHex = u8aToHex(signature);
// console.log('sigHex', sigHex)

// const x=tx.addSignature(From.address, sigHex, payload);
// console.log('xxxxL::',x)


// create the payload
const signableData = api.createType('SignerPayload', {
  method: tx,
  nonce,
  genesisHash: api.genesisHash,
  address: From.address,
  blockHash: api.genesisHash,
//   blockHash: blockHash,
  runtimeVersion: api.runtimeVersion,
  version: api.extrinsicVersion,
//   era
});
// console.log('signableData:::', signableData)
console.log('signableData payload:::', signableData.toPayload())
// console.log('signableData json:::',JSON.stringify(signableData))
const data= signableData.toPayload()
const data1 = {
    specVersion: '0x0000002a',
    transactionVersion: '0x00000006',
    address: '5D1rVqPFxDBjYQ2fnhRVFE2cswrAFtEWPbpZAptb3Pqxiw1s',
    blockHash: '0xd9adfc7ea82be63ba28088d62b96e9270ad2af25c962afc393361909670835b2',
    blockNumber: '0x00000000',
    era: '0x00',
    genesisHash: '0xd9adfc7ea82be63ba28088d62b96e9270ad2af25c962afc393361909670835b2',
    method: '0x030000dcdc82eda877f858761c1e050a34f8fa13e4e67a9b30df4af02ec9c778f4f4241700008ca7f244b37601',
    nonce: '0x000000ac',
    signedExtensions: [],
    tip: '0x00000000000000000000000000000000',
    version: 4
  }
// return false
// console.log('data:::', data)
const s = api.createType('ExtrinsicPayload',data1, { version: api.extrinsicVersion }).sign(From);

const { signature }= s
console.log('sssss::',signature)
// console.log('addSignature::::', tx.addSignature)
// console.log('addSignature::::',JSON.stringify( tx.addSignature))
tx.addSignature(From.address, '0x01c82475490492d8b29b343120148dbdbfcbf8995acf260ad59d81e58102382570cebdcd57febeffb61d1e521f348a9c059dbf790014ee042dee982e1d3a2d0986',data1);

try {
    const txhash= await tx.send()
    console.log('tx::complt');
    return txhash
    // return false
  

//   return JSON.stringify( signableData.toPayload())
} catch (error) {
  console.error('error',error);
}
    // try{
    //     const { event, data } = await runTransaction(txPallets.nfts, txActions.burn, user, [nftId], false, txEvent.nftsBurned)
    //     const nft_Id =  data[0].toString();
    //     return nft_Id;
    // }
    // catch(err){
    //     return err
    // }
};

export const getNftData = async (nftId: any) => {
    const nftData = JSON.parse(await (await getApi()).query.nfts.data(nftId));
    return nftData;
};

export const generateAndUploadNftJson = (
    title: string,
    description: string,
    imagePreviewIPFSHash: string,
    mediaIPFSHash: string,
    mediaType: string,
    mediaSize: string,
    encryptedMediaType: string,
    encryptedMediaIPFSHash: string,
    encryptedMediaSize: string,
    publicPgpIPFSHash: string,
    additionalProperties?: object) => {
    const data = {
        title,
        description,
        image: (mediaType == "image/jpeg" || mediaType == "image/png" || mediaType == "image/svg") ? mediaIPFSHash : imagePreviewIPFSHash || '',
        properties: {
            preview: {
                ipfs: mediaIPFSHash,
                mediaType: mediaType,
                size: mediaSize,
            },
            cryptedMedia: {
                ipfs: encryptedMediaIPFSHash,
                cryptedMediaType: encryptedMediaType,
                size: encryptedMediaSize,
            },
            publicPGP: publicPgpIPFSHash,
            ...additionalProperties
        },
    }
    const nftJsonFile = contentToStream(JSON.stringify(data), `./tmp/nft_${uuid()}.json`)
    return uploadIPFS(nftJsonFile);
}

export const isCapsule = async (nftId: number) => {
    const nftData: any = await getNftById(nftId);
    return nftData ? nftData.isCapsule : null;
}

export const isNftOwner = async (userAddress: string, nftId: any) => {
    const nftData: any = await getNftById(nftId);
    return checkNftOwnerEqualTo(userAddress, nftData)
}
export const checkNftOwnerEqualTo = (userAddress:string, nftData:any)=> nftData.owner === userAddress;
export const isNftCapsule = async (nftId: any) => {
    const nftData: any = await getNftById(nftId);
    return checkIsNftCapsule(nftData);
}
export const checkIsNftCapsule = (nftData:any)=> nftData.isCapsule === true;

export const listNft = async (nftId: number, seed: string, price: number, mpId: number): Promise<any> => {
    const sender = await getUserFromSeed(seed);
    return runTransaction(txPallets.marketplace, txActions.list, sender, [nftId, getChainPrice(price), mpId], false, 'marketplace.NftListed')
};
export const lockNftSerie = async (seriesId: string, seed: string): Promise<any> => {
    const sender = await getUserFromSeed(seed);
    return runTransaction(txPallets.nfts, txActions.finishSeries, sender, [seriesId], false)
};
export const unlistNft = async (nftId: number, seed: string): Promise<any> => {
    const sender = await getUserFromSeed(seed);
    return runTransaction(txPallets.marketplace, txActions.unlist, sender, [nftId], false, 'marketplace.NftUnlisted')
};

export const encryptAndUploadService=async(fileName:any)=>{
    try{
        const secretFileStream: any = getFileStreamFromName(fileName);
        const pgp = await generatePgp();
        const [{ url: encryptedMedia, IPFSHash: encryptedMediaIPFSHash, size: encryptedMediaSize, mediaType: encryptedMediaType }, { url: publicPgpLink, IPFSHash: publicPgpIPFSHash }]: any = await cryptAndUploadNFT(secretFileStream, pgp.publicKey);
        const privateKeyFilePath = localKeysFolder + publicPgpIPFSHash
        fs.writeFileSync(privateKeyFilePath, pgp.privateKey);
        return {
            encryptedMedia,
            publicPgpLink,
            encryptedMediaIPFSHash,
            encryptedMediaType,
            encryptedMediaSize,
            publicPgpIPFSHash,
            privateKeyFilePath,
        };
    }catch (err){
        console.log('encryptAndUploadService err', err);
        throw err
    }
    
}

export const ProcessPreviewFiles =async (file:UploadedFile)=>{
    const fileName = `${uuid()}_${file.name}`;
    const destPath = getFilePath(fileName);
    try{
        await file.mv(destPath)//, async function (err) {if (err) {throw err}})
        const data=await uploadImService(fileName);
        fs.unlinkSync(destPath);
        return data;
    }
    catch(err){
        return null;
    }
}

export const ProcessEncryptedFiles =async (file:UploadedFile)=>{
    const fileName = `${uuid()}_${file.name}`;
    const destPath = getFilePath(fileName);
    try{
        await file.mv(destPath)//, async function (err) {if (err) {throw err}})
        const data =await encryptAndUploadService(fileName) as any;
        fs.unlinkSync(destPath);
        return data;
    }
    catch(err){
        return null;
    }
}

export const decryptNftOrCapsule = async (nftId: number, seed: string): Promise<any> => {
    const sender = await getUserFromSeed(seed);
    const [privatePgpKey, nftData] = await Promise.all([
        getPgpPrivateKeyFromSgxNodes(nftId, sender),
        getNftData(nftId)
    ]);
    console.log('privatePgpKey, nftData', privatePgpKey, nftData);
    const nftJsonData = await getNftDatafromIpfs(nftData.ipfs_reference);
    const encryptedNftData = await getNftDatafromIpfs(nftJsonData.properties.cryptedMedia.ipfs)
    const contentType = nftJsonData.properties.cryptedMedia.cryptedMediaType;
    const pgpPrivateKey: openpgp.PrivateKey = await openpgp.readPrivateKey({ armoredKey: privatePgpKey as string });
    const pgpMsg = await openpgp.readMessage({ armoredMessage: encryptedNftData });
    const result = await openpgp.decrypt({ message: pgpMsg, decryptionKeys: pgpPrivateKey });
    const {  data: base64Data } = result;
    return `data:${contentType};base64,${base64Data}`;
};

export const nftTransferService=async(nftId:any,recieverAddress:any,seed:any) => {
    const sender = await getUserFromSeed(seed);
    return runTransaction(txPallets.nfts, txActions.transfer, sender, [nftId ,recieverAddress ], false, txEvent.nftsTransfered)
};