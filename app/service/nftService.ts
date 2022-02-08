import * as openpgp from 'openpgp';
import { v4 as uuid } from 'uuid';
import axios from 'axios';
import { uploadIPFS } from '../service/ipfsService';
import * as fs from 'fs';
import { UploadedFile } from 'express-fileupload';
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
import { getApi, getChainPrice, getUserFromSeed, runTransaction } from './blockchain.service';
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
export const createNftBatch = (jsonNftBatch: any, seriesId: string, user: any) => {
    return new Promise(async (resolve, reject) => {

        const nftTransactions = await Promise.all(jsonNftBatch.map((jsonNftItemHash: any) => createNftTransaction(jsonNftItemHash, seriesId)));
        const nftsDataList: any = [];
        const unsub = await ((await getApi()).tx.utility.batch(nftTransactions)).signAndSend(user, ({
            events = [],
            status = { isInBlock: false }
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
    })
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
        return err
    }
};

export const burnNftTransaction = async (nftId: string) => ((await getApi()).tx.nfts.burn(nftId));
export const burnNftsBatchService =async (nftIds: any, user: any) => {
    try{
        const nftTransactions = await Promise.all(nftIds.map((nftId: string) => burnNftTransaction(nftId)));
        const { event, data } = await runTransaction(txPallets.utility, txActions.batch, user, [nftTransactions], false, txEvent.nftsBurned)
        console.log('burnNftsBatchService : data', data);
        const nft_Id =  data[0].toString();
        return nft_Id;
    }
    catch(err){
        return err
    }
};

export const burnNftService = async (nftId: any, user: any) => {
    try{
        const { event, data } = await runTransaction(txPallets.nfts, txActions.burn, user, [nftId], false, txEvent.nftsBurned)
        const nft_Id =  data[0].toString();
        return nft_Id;
    }
    catch(err){
        return err
    }
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
    publicPgpIPFSHash: string) => {
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
    try{
        const sender = await getUserFromSeed(seed);
        return runTransaction(txPallets.marketplace, txActions.list, sender, [nftId, getChainPrice(price), mpId], false, 'marketplace.NftListed')
    }
    catch (err)
    {
        return err
    }
};
export const lockNftSerie = async (seriesId: string, seed: string): Promise<any> => {
    try{
        const sender = await getUserFromSeed(seed);
        return runTransaction(txPallets.nfts, txActions.finishSeries, sender, [seriesId], false)
    }
    catch (err)
    {
        return err
    }
};
export const unlistNft = async (nftId: number, seed: string): Promise<any> => {
    try{
        const sender = await getUserFromSeed(seed);
        return runTransaction(txPallets.marketplace, txActions.unlist, sender, [nftId], false, 'marketplace.NftUnlisted')
    }
    catch (err)
    {
        return err
    }
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