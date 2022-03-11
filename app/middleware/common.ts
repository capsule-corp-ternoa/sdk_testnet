import { NextFunction, Request, Response } from "express";
import { getSeedFromRequest } from "../helpers";
import { getUserFromSeed } from "../service/blockchain.service";
import { getNftById } from "../service/ternoa.indexer";
import { getRequestedNftId } from "./nft";

export const contextSetterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all([
        contextUserSetter(req),
        contextNftSetter(req),
    ]).catch(e=>{
        return res.status(400).send(e.message);
    });
    next();
};
const contextUserSetter = async (req: Request) => {
    const seed = getSeedFromRequest(req);
    if (!seed){
        throw new Error('No seed given');
    }
    const user = await getUserFromSeed(seed);
    if (!user){
        throw new Error('Invalid seed');
    }
    req.body.user = user;
}
const contextNftSetter = async (req: Request) => {
    const nftId = getRequestedNftId(req);
    if (!nftId){
        throw new Error('No nft id given');
    }
    const nftData= await getNftById(nftId)
    if (!nftData){
        throw new Error('Invalid nft id');
    }
    req.body.nft = nftData;
}

export const checkMimeType=async(req:Request,res:Response,next:NextFunction)=>{
    const file=req.files?.file as any;
    console.log(file.mimetype);
    if(file.mimetype==='image/jpeg' || file.mimetype==='image/png' || file.mimetype==='image/svg' ||  file.mimetype==='image/svg+xml' || file.mimetype==='video/mp4')
    {
        next();
    }
    else
    {
        res.status(403).send('file type must be of jpeg,png,svg or mp4!')
    }   
}

export const fileSizeCheck=async(req:Request,res:Response,next:NextFunction)=>{
    const file=req.files?.file as any;
    let sizeInMbs=(file.size/1024)/1024;
    sizeInMbs<=30?next():res.status(403).send("File Size Must be Less than 30mbs")
}

export const allFileSizeChecks=async (req: Request, res: Response, next: NextFunction)=>{ 
    const previewFile=req.files?.previewFile as any;
    const encryptFile=req.files?.encryptFile as any;
    const ImagePreviewFile=req.files?.ImagePreviewFile as any;
    const previewFileSize= (previewFile.size/1024)/1024;
    const encryptFileSize= (encryptFile.size/1024)/1024;
    const ImagePreviewFileSize=ImagePreviewFile? (ImagePreviewFile.size/1024)/1024:-1;
    if(previewFileSize<=30 && encryptFileSize<=30 && ((ImagePreviewFileSize!=-1 && ImagePreviewFileSize<=30) || ImagePreviewFileSize===-1 ))
    {
        next();
    }
    else
    {
        res.status(400).send("Media File size must be less than 30 mbs!");
    }

}

export const checkMimeTypeforCreateNft=async(req:Request,res:Response,next:NextFunction)=>{
    const previewFile=req.files?.previewFile as any;
    const encryptFile=req.files?.encryptFile as any;
    const ImagePreviewFile=req.files?.ImagePreviewFile as any;
    if((previewFile.mimetype==='image/jpeg' || previewFile.mimetype==='image/png' || previewFile.mimetype==='image/svg' ||  previewFile.mimetype==='image/svg+xml' || previewFile.mimetype==='video/mp4') && 
    (encryptFile.mimetype==='image/jpeg' || encryptFile.mimetype==='image/png' || encryptFile.mimetype==='image/svg' ||  encryptFile.mimetype==='image/svg+xml' || encryptFile.mimetype==='video/mp4') )
    {
        if(!ImagePreviewFile)
        {
            next();
        }
        else
        {
            if((ImagePreviewFile.mimetype==='image/jpeg' || ImagePreviewFile.mimetype==='image/png' || ImagePreviewFile.mimetype==='image/svg' ||  ImagePreviewFile.mimetype==='image/svg+xml' ) )
            {
                next();
            }
            else
            {
                res.status(403).send('Image preview file type must be of jpeg,png, or svg!')
            }
        }
        
    }
    else
    {
        res.status(403).send('file type must be of jpeg,png,svg or mp4!')
    }   
}