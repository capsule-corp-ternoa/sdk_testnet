import { Request, response, Response,NextFunction } from 'express';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';
import { UploadedFile } from 'express-fileupload';
import _, { values } from 'lodash';

import {
  getFilePath,
} from '../../common';
import {
  createNft,
  burnNftService,
  burnNftsBatchService,
  generateAndUploadNftJson,
  isCapsule,
  ProcessPreviewFiles,
  ProcessEncryptedFiles,
  listNft,
  lockNftSerie,
  unlistNft,
  encryptAndUploadService,
  decryptNftOrCapsule,
  nftTransferService
} from '../service/nftService';

import {
  getNftById,
  getNftsByOwner,
  getNftIdsBySeries,
  getNftsByIds,
  getNftByIdWithLastOwner

} from '../service/ternoa.indexer';

import {
  getSgxNodes,
  saveSSSAToSGX
} from '../service/sgxService';
import { getApi, getUserFromSeed } from '../service/blockchain.service';
import { getSeedFromRequest } from '../helpers';
import { nextTick } from 'process';

const localKeysFolder = process.env.LOCAL_KEYS_FOLDER || './nftKeys/';

export const getNftDataFromIndexer = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const nftIndexerData = await getNftByIdWithLastOwner(id);
    if(nftIndexerData && nftIndexerData.nftEntity){
      let Data= {...nftIndexerData.nftEntity, }
      if(nftIndexerData && nftIndexerData.nftTransferEntities && nftIndexerData.nftTransferEntities.nodes &&nftIndexerData.nftTransferEntities.nodes[0]){
        Data ={...Data, previousOwner:nftIndexerData.nftTransferEntities.nodes[0].from}
      }else {
        Data ={...Data, previousOwner:null}
      }
      res.status(200).json(
        {
          Message :`Nft Data For ID: ${id}`,
          Data
        });
    }else {
      res.status(200).json(
        {
          Message :`no data For ID: ${id}`,
        });
    }
  
  }
  catch (err) {
    res.status(500).send(
      {
        Message:'An error has occured while fetching Nft Data',
        Details: err
      });
  }
};

export const getNftIdBySeries = async (req: Request, res: Response) => {
  const { seriesId } = req.params;
    try {
      const nftIndexerData = await getNftIdsBySeries(seriesId, null);
      res.status(200).json(
        {
          Message:`Nft ids against Series Id: ${seriesId}`,
          Data:nftIndexerData
        });

    }
    catch (err) {
      res.status(500).json({ 
        message: 'Unable to Fetch Nft Ids', 
        details:err && (err as any).message?(err as any).message:err
      });
    }
};

export const getNftIdBySeriesForOwner = async (req: Request, res: Response) => {
  const { seriesId, ownerAddress } = req.params;
    try {
      const nftIndexerData = await getNftIdsBySeries(seriesId,ownerAddress);
      res.status(200).json(
        {
          Message:`Nft ids against Series Id: ${seriesId}`,
          Data:nftIndexerData
        });

    }
    catch (err) {
      res.status(500).json({ 
        message: 'Unable to Fetch Nft Ids', 
        details:err && (err as any).message?(err as any).message:err
      });
    }
};


export const getNftIdBySeriesId = async (req: Request, res: Response) => {
  const { seriesId} = req.params;
    try {
    //  const nftIndexerData = await //getNftIdsBySeries(seriesId,ownerAddress);
      res.status(200).json(
        {
          Message:`Nft ids against Series Id: ${seriesId}`,
      //    Data:nftIndexerData
        });

    }
    catch (err) {
      res.status(500).json({ 
        message: 'Unable to Fetch Nft Ids', 
        details:err && (err as any).message?(err as any).message:err
      });
    }
};


export const getNFTsByOwner = async (req: Request, res: Response) => {
  const { address } = req.params;
  try {
    const IndexerData = await getNftsByOwner(address);
    let nftIds: Array<object> = []
    if (IndexerData && (IndexerData as any).nodes.length) {
      nftIds = (IndexerData as any).nodes.map((node: any) => (node.id))
    }
    res.status(200).json(
      {
        Message:`Nft Ids for the Owner Address: ${address}`,
        NftIds:nftIds
      }
    );
  }
  catch (err) {
      res.status(500).json({ 
        message: 'Unable to Fetch Nft Ids', 
        details:err && (err as any).message?(err as any).message:err
      });
  }

};

export const encryptAndUploadMedia = async (req: Request, res: Response) => {
  const file = req.files?.file as UploadedFile; 
  const fileName = `enc_${uuid()}_${file.name}`;
  const destPath = getFilePath(fileName);
  try {
    await file.mv(destPath)//, async function (err) {if (err) {throw err;}});
    const data=await encryptAndUploadService(fileName) as any;
    const obj=data;
    res.status(200).json(
      {
        Message:"File Encrypted!",
        Data:obj
      }
    );      
    if (fs.existsSync(destPath)) 
    {
      fs.unlinkSync(destPath);
    }
  }
  catch (err) 
  {
    res.status(500).json({ 
        message: 'Unable to Encrypt and Upload file to Ipfs.', 
        details:err && (err as any).message?(err as any).message:err
      });
  }

};


export const uploadNFTJson = async (req: Request, res: Response) => {
  const { title, description, imagePreviewIPFSHash, mediaIPFSHash, mediaSize, mediaType, encryptedMediaIPFSHash, encryptedMediaType, encryptedMediaSize, publicPgpIPFSHash } = req.body;
  try {
    const { url, IPFSHash } = await generateAndUploadNftJson(title, description, imagePreviewIPFSHash, mediaIPFSHash, mediaType, mediaSize, encryptedMediaType, encryptedMediaIPFSHash, encryptedMediaSize, publicPgpIPFSHash);
    res.status(200).json({
      Message: 'Nft Json Upload To IPFS!', 
      Data:{
        Ipfsurl:url,
        IpfsHash:IPFSHash
      }
    });
  } catch (err) {
      res.status(500).json({ 
        message: 'Unable to Upload Nft Json to Ipfs', 
        details:err && (err as any).message?(err as any).message:err
      });
  }
};

export const mintNFT = async (req: Request, res: Response) => {
  const { privateKeyFilePath, nft_ipfs, seriesId } = req.body;
  const seed = getSeedFromRequest(req);
  try {
      const sender = await getUserFromSeed(seed);
      const nftId = await createNft(nft_ipfs, seriesId, sender) as any;
      if(nftId)
      {
        await getSgxNodes();
        const privateKey = fs.readFileSync(privateKeyFilePath) as any;
        const sgxResponse = await saveSSSAToSGX(privateKey, nftId, sender);
        res.json({ 
          Response:`Nft Minted with ID:${nftId}`,
          sgxResponse: sgxResponse
        });
      }
      else
      {
        res.status(500).send("Error Creating Nft!")
      }  
    } 
    catch (err) {
      res.status(500).json(
        {
          message:'Error creating Nft on blockchain!',
          details:err && (err as any).message?(err as any).message:err
        }
      )
    }
};

export const createNewNFT = async (req: Request, res: Response,next:NextFunction) => {

  const previewFile = req.files?.previewFile as UploadedFile;
  const encryptFile =req.files?.encryptFile as UploadedFile;
  const ImagePreviewFile=req.files?.ImagePreviewFile as UploadedFile;
  const {title,description,seriesId}=req.body;
  
  const seed = getSeedFromRequest(req)
  const sender = await getUserFromSeed(seed);
  try {

    const PreviewFileData=ProcessPreviewFiles(previewFile) as any;
    const encryptedData=ProcessEncryptedFiles(encryptFile) as any;
    const imagePreviewData=ImagePreviewFile?ProcessPreviewFiles(ImagePreviewFile):null as any;
    
    Promise.all([PreviewFileData,encryptedData,imagePreviewData]).then(async(values)=>{
      const { url, IPFSHash } = await generateAndUploadNftJson(title, description, imagePreviewData?values[2].mediaIPFSHash:null,
              values[0].mediaIPFSHash, values[0].mediaType, values[0].mediaSize, values[1].encryptedMediaType,
              values[1].encryptedMediaIPFSHash,values[1].encryptedMediaSize, values[1].publicPgpIPFSHash);
      const nftId = await createNft(IPFSHash,seriesId?seriesId:'', sender) as any;
      if(nftId)
      {
        await getSgxNodes();
        const privateKey = fs.readFileSync(values[1].privateKeyFilePath) as any;
        const sgxResponse = await saveSSSAToSGX(privateKey, nftId, sender);
        res.json({ 
          Response:`Nft Minted with ID:${nftId}`,
          sgxResponse: sgxResponse
        });
      }
      else
      {
        res.status(500).send("Error Creating Nft!")
      }  
     
    })
  }
  catch (err) {
    res.status(500).json(
      {
        message:'Error creating Nft on blockchain!',
        details:err && (err as any).message?(err as any).message:err
      })
  }
}

export const burnNftBatch = async (req: Request, res: Response) => {
  const { nftIds } = req.body;
  const seed = getSeedFromRequest(req);
  const signer = await getUserFromSeed(seed)
  const ownerAddress= signer.address
  const nftsData: any = await getNftsByIds(nftIds)
  const nftsNodes = nftsData?.nodes as any[]
  // console.log('nftsNodes length', nftsNodes.length)
  // console.log('nftsNodes', nftsNodes)
  if (nftsNodes?.length === 0) {res.status(403).json('No nfts to burn'); return;}
  if (nftsNodes?.length !== nftIds.length) {res.status(403).json('Some nfts are already burnt'); return;}
  if (nftsNodes.findIndex(x => x.isCapsule) !== -1) {
    res.status(403).json('Some nfts are capsules and cannot be burnt'); 
    return;}
  if (nftsNodes.findIndex(x => x.owner !== ownerAddress) !== -1) {
    console.log('not owned', nftsNodes.filter(y=> y.owner !== ownerAddress))
    res.status(403).json('You do not own all nfts'); return;
  }
    try {
      await burnNftsBatchService(nftIds,signer)
      res.status(200).json({
        message:"nfts burned",
        nftIds: req.body.nftIds
      })
    }
    catch (err) {
      res.status(404).send(err)
    }  
};

export const burnNft = async (req: Request, res: Response) => {
  const { nftId } = req.body as any;
  const capsuleCheck: any = await isCapsule(nftId);
  if (!capsuleCheck) {
    const seed = getSeedFromRequest(req)
    try {
      const user = await getUserFromSeed(seed);
      const data = await burnNftService(nftId, user);
      res.status(200).json({
        response:`Nft Burned on Blockchain with id : ${data}`
      })
    }
    catch (err) 
    {
       res.status(500).json(
      {
        message:'Error Burning Nft on blockchain!',
        details:err && (err as any).message?(err as any).message:err
      })
    }
  }
  else
  {
    res.status(403).send('Forbidden! Cannot remove a Capsule!')
  }
      
};

export const NftSale = async (req: Request, res: Response) => {
  const { nftId, price, mpId } = req.body;
  const seed = getSeedFromRequest(req);
  try {
    await listNft(nftId, seed, price, mpId);
    res.status(200).json({Message:`NFT ${nftId} listed for ${price} CAPS on Marketplace ID : ${mpId}`});
  }
  catch (err) {
      res.status(500).json({ 
        message: 'Unable to List this Nft for sale.', 
        details:err && (err as any).message?(err as any).message:err
      });
  }
}
export const serieLock = async (req: Request, res: Response) => {
  const { seriesId } = req.body;
  const seed = getSeedFromRequest(req);
  try {
    await lockNftSerie(seriesId, seed);
    res.status(200).json({Message:`NFT serie ${seriesId} was locked successfully`});
  }
  catch (err) {
    res.status(500).json({ 
        message: 'Unable to Lock Nft Serie.', 
        details:err && (err as any).message?(err as any).message:err
    });
  }
}
export const NftUnlist = async (req: Request, res: Response) => {
  const nftId  = req.body.nftId;
  const seed = getSeedFromRequest(req);;
  try {
    await unlistNft(Number(nftId), seed);
    res.status(200).json({Message:`NFT ${nftId} was successfully unlisted`});
  }
  catch (err) {
    res.status(500).json({ 
        message: 'Unable to Unlist Nft from Sale.', 
        details:err && (err as any).message?(err as any).message:err
      });
  }
}
export const decryptNft = async (req: Request, res: Response) => {
  const { nftId } = req.body;
  const seed = getSeedFromRequest(req);;
  try {
    const decrypted = await decryptNftOrCapsule(Number(nftId), seed);
    console.log('decrypted', decrypted);
    res.status(200).json({
      Message:`Nft/Capsule Item Decrypted for Id:${nftId}.`,
      Data:decrypted
    });
  
  }
  catch (err) {
    res.status(500).json({ 
        message: 'Unable to Decrypt Nft.', 
        details:err && (err as any).message?(err as any).message:err
      });
  }
} 

export const nftTransfer= async (req: Request, res: Response) => {
  const {nftId,recieverAddress}=req.body;
  try{
    const seed=getSeedFromRequest(req);
    await nftTransferService(nftId,recieverAddress,seed);
    res.status(200).json({
        message:`Success! transfer Nft with Id: ${nftId} to Account: ${recieverAddress}.`,
    })
  }
  catch(err){
    res.status(500).json(
      {
        message:`Unable to transfer Nft with Id: ${nftId} to Account: ${recieverAddress} `,
        details:err && (err as any).message?(err as any).message:err
      }
    )
  }
}