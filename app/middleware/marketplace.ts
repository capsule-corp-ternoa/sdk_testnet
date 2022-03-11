import { NextFunction, Request, Response } from "express";

import { getSeedFromRequest } from "../helpers";
import { getUserFromSeed } from "../service/blockchain.service";
import { getMarketplaceDataByIdFromBlockChain } from "../service/marketPlaceService";

export const checkMpOwnershipMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {mpId} = req.body;
        const seed = getSeedFromRequest(req);
        const user = await getUserFromSeed(seed);
        const marketPlaceData=await getMarketplaceDataByIdFromBlockChain(mpId);
        if(user && marketPlaceData)
        {
            if(marketPlaceData.owner===user.address)
            {
                next();
            }
            else
            {
                res.status(403).send('Forbidden! Not a Marketplace Owner!')
            }
        }
        else
        {
            res.status(500).send("Data Fetch Error!")
        }
    }catch(err){
        console.log('error', err)
        res.status(500).json({
            message:'operation failed',
            details:err && (err as any).message?(err as any).message:err
        })
    }
   
    
}
export const marketPlaceTypeMiddleWare=async (req: Request, res: Response, next: NextFunction) => {
     try{
        const {mpId} = req.body;
        const seed = getSeedFromRequest(req);
        const user = await getUserFromSeed(seed);
        const marketPlaceData=await getMarketplaceDataByIdFromBlockChain(mpId);
        if(user && marketPlaceData)
        {
            if(marketPlaceData.kind==='Private')
            {

                next();
            }
            else
            {
                res.status(403).send('Forbidden! UnSupported Marketplace Type!')
            }
        }
        else
        {
            res.status(500).send("Data Fetch Error!")
        }
    }catch(err){
        console.log('error', err)
        res.status(500).json({
            message:'operation failed',
            details:err && (err as any).message?(err as any).message:err
        })
    }
}

export const marketPlacePublicTypeMiddleWare=async (req: Request, res: Response, next: NextFunction) => {
     try{
        const {mpId} = req.body;
        const seed = getSeedFromRequest(req);
        const user = await getUserFromSeed(seed);
        const marketPlaceData=await getMarketplaceDataByIdFromBlockChain(mpId);
        if(user && marketPlaceData)
        {
            if(marketPlaceData.kind==='Public')
            {
                next();
            }
            else
            {
                res.status(403).send('Forbidden! UnSupported Marketplace Type!')
            }
        }
        else
        {
            res.status(500).send("Data Fetch Error!")
        }
    }catch(err){
        console.log('error', err)
        res.status(500).json({
            message:'operation failed',
            details:err && (err as any).message?(err as any).message:err
        })
    }
}
export const checkMarketPlaceExistence =async (req: Request, res: Response, next: NextFunction) => {
    const {mpId} = req.body;
    console.log(mpId)
    try{
        const marketPlaceData=await getMarketplaceDataByIdFromBlockChain(mpId);
        if(marketPlaceData)
        {
            next();
        }
        else
        {
            res.status(404).send("MarketPlace of particular Id doesnot exist!")    
        }
    }
    catch(err)
    {
        res.status(404).send("MarketPlace of particular Id doesnot exist!")
    }   
}