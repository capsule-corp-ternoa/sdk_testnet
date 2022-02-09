import { Request, Response } from 'express'
import { v4 as uuid } from 'uuid';
import { UploadedFile } from 'express-fileupload';

import {
  getNftPublicKey, 
  getNftDatafromIpfs, 
  getNftData 
} from '../service/nftService';

import {
  getFilePath,
  getFileStreamFromName 
} from '../../common';

import {
  cryptAndUploadCapsule, 
  generateAndUploadCapsuleJson, 
  CreateFromNftService,
  capsuleMetaData, 
  removeCapsuleService, 
  createCapsuleService, 
  getCapsuleItems, 
  setCapsuleIpfsReferenceService,
  addFileToCapsule as addCapsuleItem, 
  removeCapsuleItem
} from '../service/capsuleService';

import {  getUserFromSeed } from '../service/blockchain.service';

import { getSeedFromRequest } from '../helpers';


export const setIpfsReference = async (req: Request, res: Response) => {
  const { nftId, ipfs } = req.body;
  const seed =await getSeedFromRequest(req);
  try {
    await setCapsuleIpfsReferenceService(nftId, ipfs, seed);
    res.status(200).json(
      {
        Message:`Ipfs Reference Updated for Capsule/Nft Id: ${nftId}`
      }
    );
  }
  catch (err) {
      res.status(500).json({ 
        message: 'Unable to update Capsule Ipfs Reference on blockchain.', 
        details:err && (err as any).message?(err as any).message:err
      });
  }
}
  
export const CapsuleItems = async (req: Request, res: Response) => {
  const { nftId } = req.params;
  try {
    const data = await getCapsuleItems(nftId);
    res.status(200).json({ 
      Message:`Capsule Items for Capsule/Nft Id: ${nftId}`,
      Data:data 
    });
  }
  catch (err) {
      res.status(500).json({ 
        message: 'Unable to Fetch Capsule Items.', 
        details:err && (err as any).message?(err as any).message:err
      });
  }
}

export const getCapsuleMetadata = async (req: Request, res: Response) => {
  const  nftId:any  = req.params.nftId;
  try {
    const Data = await capsuleMetaData(nftId);
    res.status(200).json( 
      {
        Message:`Capsule Data for Capsule/Nft Id: ${nftId}`,
        Data:Data ?{Data}:"No Record Found!"
      }
    )
  }
  catch (err) {
      res.status(500).json({ 
        message: 'Unable to Fetch Capsule Data', 
        details:err && (err as any).message?(err as any).message:err
      });
  }
}

export const capsuleItemEncrypt = async (req: Request, res: Response) => {
  const file = req.files?.file as UploadedFile;
  const nftId = req.params.nftId as any;
  const fileName = `enc_${uuid()}_${file.name}`;
  const destPath = getFilePath(fileName);
  file.mv(destPath, async function (err) {
    if (err) {
      throw err;
    }
    try {
      const nftdata = await getNftData(nftId) as any;
      const nftIpfsdata = await getNftDatafromIpfs(nftdata.ipfs_reference);
      const publicPgpLink = nftIpfsdata.properties.publicPGP
      const nftPublicKey = await getNftPublicKey(publicPgpLink);
      const secretFileStream: any = getFileStreamFromName(fileName);
      const {mediaType, IPFSHash, size, url}: any = await cryptAndUploadCapsule(secretFileStream, nftPublicKey);
      res.status(200).json({
        Message:`File Encrypted for Capsule Media for ${nftId}.`,
        Data:{url, ipfs:IPFSHash, mediaType,size, publicPgpLink}
      });
    } catch (err) {
        res.status(500).json({ 
          message: 'Unable to Encrypt or Upload a file on Ipfs.', 
          details:err && (err as any).message?(err as any).message:err
        });
    }
  });
};

export const uploadCapsuleJson = async (req: Request, res: Response) => {
  const { capsuleCryptedMedias } = req.body;
  try {
    const { url, IPFSHash } = await generateAndUploadCapsuleJson(capsuleCryptedMedias);
    res.status(200).json({
        Message:`Json Uploaded.`,
        Data:{ url, ipfs:IPFSHash }});
  } catch (err) {
      res.status(500).json({ 
        message: 'Unable to Upload Capsule Json on Ipfs', 
        details:err && (err as any).message?(err as any).message:err
      });
  }
};

export const addFileToCapsule = async (req: Request, res: Response) => {
  const nftId = req.params.nftId as any;
  const capsuleFile = req.files?.capsuleFile as UploadedFile;
  const {title}= req.body;
  const seed = getSeedFromRequest(req);
  const fileName = `enc_${uuid()}_${capsuleFile.name}`;
  const destPath = getFilePath(fileName);
  capsuleFile.mv(destPath, async function (err) {
    if (err) {
      throw err;
    }
    try {
      const nftdata = await getNftData(nftId) as any;
      const nftIpfsdata = await getNftDatafromIpfs(nftdata.ipfs_reference);
      const publicPgpLink = nftIpfsdata.properties.publicPGP
      const nftPublicKey = await getNftPublicKey(publicPgpLink);
      const secretFileStream: any = getFileStreamFromName(fileName);
      const cryptAndUploadRes: any= await cryptAndUploadCapsule(secretFileStream, nftPublicKey);
      const { IPFSHash: encryptedMediaIPFSHash, size: encryptedMediaSize, mediaType: encryptedMediaType } = cryptAndUploadRes;
      const newIpfs = await addCapsuleItem(title, encryptedMediaIPFSHash, encryptedMediaType, encryptedMediaSize, nftId) as any;
      if(newIpfs)
      {
        await setCapsuleIpfsReferenceService(nftId, newIpfs.IPFSHash, seed);
        res.status(200).json({ 
          Message:`File Added to CapsuleCryptedMedia for Capsule/Nft Id:${nftId}.`,
          Data:{newIpfs}
         })
      }
      else
      {
        res.status(500).send("Internal Server error!")
      }
    } catch (err) {
        res.status(500).json({ 
          message: 'Unable to Add File to Capsule Media', 
          details:err && (err as any).message?(err as any).message:err
        });
    }
  });
}

export const nftToCapsule = async (req: Request, res: Response) => {
  const { nftId, ipfs } = req.body;
  const seed = getSeedFromRequest(req);
  try {
    const nft_Id=await CreateFromNftService(nftId, ipfs, seed);
    res.status(200).json({
      Message:`Nft Id :${nft_Id} is Successfully converted to Capsule.`
    })
  }
  catch (err) {
    res.status(500).json({ 
      message: 'Unable to conver nft to Capsule', 
      details:err && (err as any).message?(err as any).message:err
    });
  }
}

export const CapsuleToNft = async (req: Request, res: Response) => {
  const { nftId } = req.params;
    const seed = getSeedFromRequest(req);;
    try {
      const sender = await getUserFromSeed(seed);
      await removeCapsuleService(nftId, sender);
      res.status(200).json({
        Message:`Capsule Successfully Converted Back to Nft.`,
        NftId:nftId
      })
    }
    catch (err) {
      res.status(500).json({ 
        message: 'Unable to Convert Capsule Back to Nft', 
        details:err && (err as any).message?(err as any).message:err
      });
    }
}

export const createCapsule = async (req: Request, res: Response) => {
  const { nft_ipfs, capsule_ipfs, series_id } = req.body;
  const seed = getSeedFromRequest(req);
  try {
    const sender = await getUserFromSeed(seed);
    const nftId=await createCapsuleService(nft_ipfs, capsule_ipfs, series_id, sender);
    res.status(200).json({
        Message:`Capsule Created on BlockChain.`,
        NftId:nftId
    })
  }
  catch (err) {
    res.status(500).json({ 
      message: 'Unable to Create Capsule On blockchain!', 
      details:err && (err as any).message?(err as any).message:err
    });
  }
}

export const removeFileFromCapsule = async (req: Request, res: Response) => {
  const { fileIpfs } = req.body;
  const nftId=req.params.nftId as any;
  const seed = getSeedFromRequest(req);
  try {
    const sender = await getUserFromSeed(seed);
    let result: any = await removeCapsuleItem(nftId, fileIpfs);
    if (result !== false) {
      await setCapsuleIpfsReferenceService(nftId, result.IPFSHash, seed);
      res.status(200).json({
        Message:`File Removed from Capsule Crypted Media Id ${nftId}`,
        Data:{result} })
    }
    else {
      res.status(404).send('Item(s) not found');
    }
  }
  catch (err) {
    res.status(500).json({ 
      message: 'Unable to remove Capsule File from Ipfs', 
      details:err && (err as any).message?(err as any).message:err
    });
  }
}