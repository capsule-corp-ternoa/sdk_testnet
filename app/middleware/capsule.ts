import { NextFunction, Request, Response } from "express";
import { getSeedFromRequest } from "../helpers";
import { getNftById } from "../service/ternoa.indexer";
export const validateUploadCapsuleJsonMiddleware = async (req: Request, res: Response, next: NextFunction) => {
   const {capsuleCryptedMedias}=req.body as any;
   let validateJsonCount=0;
   capsuleCryptedMedias.map((capsuleJson:any)=>{ 
        if(capsuleJson.title && capsuleJson.ipfs && capsuleJson.size && capsuleJson.mediaType)
        {
            validateJsonCount+=1;
        }
    })
    if(capsuleCryptedMedias.length===validateJsonCount)
    {
        next()
    }
    else
    {
        res.status(400).send("All the Fields are must in Json");
    }
   
}

export const checkIfCapsuleMiddleWare = async (req: Request, res: Response, next: NextFunction) => {
   const {nftId}=req.body as any;
   const nftData=getNftById(nftId) as any;
   if(nftData){
        if(nftData.isCapsule===true){
            next();
        }
        else
        {
            res.status(400).send('This Nft is not a capsule!');
        }
   }
   else{
       res.status(400).send('No Data Found!')
   }
}