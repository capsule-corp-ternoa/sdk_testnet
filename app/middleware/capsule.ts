import { NextFunction, Request, Response } from "express";
import { getSeedFromRequest } from "../helpers";
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