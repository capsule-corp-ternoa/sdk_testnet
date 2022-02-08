import axios from 'axios';
import { v4 as uuid } from 'uuid';
import {uploadIPFS} from '../service/ipfsService';
import {contentToStream,deleteFile,getStreamFilename,cryptFilePgp } from '../../common';
import { getApi, getChainPrice, getUserFromSeed, runTransaction } from './blockchain.service';
import { txActions, txEvent, txPallets } from '../const/tx.const';

export const setCapsuleIpfsReferenceService=async(nftId:number,ipfs:string,seed:any)=>{
    try{
        const sender = await getUserFromSeed(seed);
        const { event, data } = await runTransaction(txPallets.capsules, txActions.setIpfsReference, sender, [nftId, ipfs], false, txEvent.CapsuleIpfsReferenceChanged)
        const nft_Id =  data[0].toString();
        return nft_Id;
    }
    catch (err)
    {
        return err
    }
}

export const getCapsuleItems = async (nftId:any) => {
        const capsuleMetadata=await capsuleMetaData(nftId);
        console.log('capsuleMetadata',capsuleMetadata)
        const url=`${process.env.IPFS_GATEWAY_BASE_URL}/ipfs/${capsuleMetadata.ipfs_reference}`;
        const res= await axios.get(url)
        if (res && res.data){
            return res.data.capsuleCryptedMedias
        }else {
            return 'could not get file from ipfs'
        }
};

export const CreateFromNftService=async(nftId:number,ipfs:string,seed:any)=>{
    try{
        const sender = await getUserFromSeed(seed);
        const { event, data } = await runTransaction(txPallets.capsules, txActions.createFromNft, sender, [nftId, ipfs], false, txEvent.CapsuleCreated)
        const nft_Id =  data[1].toString();
        return nft_Id;
    }
    catch (err)
    {
        return err
    }
}

export const capsuleMetaData=async (nftId:number)=>{
        const capsuleData =JSON.parse(JSON.stringify(await (await getApi()).query.capsules.capsules(nftId)))
        if(capsuleData && capsuleData.owner){
            return capsuleData
        }else {
            throw new Error("capsule not found");
        }
}

export const createCapsuleService=async(nftIpfs:string,capsuleIpfs:string,seriesId:number,user:any)=>
{
    try{
        const { event, data } = await runTransaction(txPallets.capsules, txActions.create, user, [nftIpfs,capsuleIpfs,seriesId], false, txEvent.CapsuleCreated)
        const nft_Id =  data[1].toString();
        return nft_Id;
    }
    catch (err)
    {
        return err
    }
}

export const removeCapsuleService =async (nftId: any, user: any) => {
    try{
        const { event, data } = await runTransaction(txPallets.capsules, txActions.remove, user, [nftId], false, txEvent.CapsuleRemoved)
        const nft_Id =  data[0].toString();
        return nft_Id;
    }
    catch (err)
    {
        return err
    }
}

export const cryptAndUploadCapsule= async (capsule:string,publicPGP:string) => {
    return new Promise(async(resolve,reject)=>{
        try{
            const encryptedCapsule = await cryptFilePgp(capsule, publicPGP);     
            const secretFileName = getStreamFilename(capsule);
            const encryptedPath = `./tmp/${uuid()}_${secretFileName}`;
            const encryptedFile = contentToStream(encryptedCapsule, encryptedPath);
            const encryptedUploadResponse = await uploadIPFS(encryptedFile)
            deleteFile(encryptedPath)
            resolve(encryptedUploadResponse) 
        }
        catch (err) 
        {
            reject(err)
        }
    })
}

export const generateAndUploadCapsuleJson = (title:string, ipfs:string,mediaType:string,size:number) => {
  const data={
   capsuleCryptedMedias:
    [
       {
           title,
           ipfs,
           mediaType,
           size
       }
    ] 
  }
  const capsuleJsonFile = contentToStream(JSON.stringify(data), `capsule_${uuid()}.json`)
  return uploadIPFS(capsuleJsonFile);
}

export const removeCapsuleItem=async(nftId:any,fileIpfs:string)=>{
    
    const CapsuleItems= await getCapsuleItems(nftId);
    if(CapsuleItems)
    {
        let result:any=[]
        let data:any;
        CapsuleItems.map((item:any)=>{if(item.ipfs!=fileIpfs){result.push(item)}});
        data={
            capsuleCryptedMedias:result
        }
        const capsuleJsonFile = contentToStream(JSON.stringify(data), `capsule_${uuid()}.json`)
        return uploadIPFS(capsuleJsonFile);
    }
    else
    {
        return false;
    }
}

export const addFileToCapsule = async (title:string, ipfs:string,mediaType:string,size:number,nftId:number) => {
    const CapsuleItems= await getCapsuleItems(nftId);
    var data:any;
    let JsonArray:any=[];
    const FileData=
    {
        title:title,ipfs:ipfs,type:mediaType,size:size
    }
    if(CapsuleItems)
    {
       // validateCapsuleItemsFile(CapsuleItems)
        if(CapsuleItems===''){
            JsonArray.push(FileData)
            //console.log(JsonArray); 
        }
        else{
            CapsuleItems.map((item:any)=>{JsonArray.push(item)})
            JsonArray.push(FileData);
        }
        data={
            capsuleCryptedMedias:JsonArray
        }
    }
    else
    {
        JsonArray.push(FileData)
        data={
            capsuleCryptedMedias:JsonArray
        }
    } 
    const capsuleJsonFile = contentToStream(JSON.stringify(data), `capsule_${uuid()}.json`)
    return uploadIPFS(capsuleJsonFile);
}

export const getEncryptedCapsuleItem = async (encrptedIpfsReference:string) => {
    const url=`${process.env.IPFS_GATEWAY_BASE_URL}/ipfs/${encrptedIpfsReference}`;
    const data=axios.get(url)
    .then(response=>{return response.data})
    .catch(error=>{
        return '';
    })
    return data
};

