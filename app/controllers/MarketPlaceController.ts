import { Request, Response } from 'express'
import { createMarketPlaceService ,setUriService,getMarketplaceDataByOwner as ownerDataforMp,setlogoUriService,getMarketplaceDataById,setNameService,setKindService,getMarketplaceDataByIdFromBlockChain,setCommissionFeeService,setOwnerService, getAllMarketplaceDataFromBlockChain} from '../service/marketPlaceService';


import { 
    getUserFromSeed 
} from '../service/blockchain.service';
import { getSeedFromRequest } from '../helpers';

export const createMarketPlace = async (req: Request, res: Response) => {
    const { name, commission_fee, kind, uri, logoUri } = req.body;
    const seed = getSeedFromRequest(req);
    try {
        const sender = await getUserFromSeed(seed);
        const data=await createMarketPlaceService(name, commission_fee, kind, uri, logoUri, sender);
        res.status(200).json({
            Message:`MarketPlace Created on BlockChain.`,
            Data:data
    });
    }
    catch (err) {
        res.status(500).json({ 
            message: 'Unable to Create a market place on Blockchain.', 
            details:err
        });
    }
}

export const getMarketplaceDataByOwner = async (req: Request, res: Response) => {
    const ownerAddress=req.params.ownerAddress;
    try{
        const data=await ownerDataforMp(ownerAddress);
        if(data)
        {
            res.status(200).json({
                message:`Marketplace data for owner: ${ownerAddress}` ,
                data:data
            })
        }
        else
        {
            res.status(404).send("Unable to fetch marketplace data.")
        }
    }
    catch(err)
    {
        res.status(500).json({
            message:"Unable to Fetch Data",
            details:err && (err as any).message?(err as any).message:err
        })
    }
}
        
export const getMarketplaceById = async (req: Request, res: Response) => {
    const id=req.params.id as any;
    try{
        const data=await getMarketplaceDataById(id);
        if(data)
        {
            res.status(200).json({
                message:`Marketplace data for Id: ${id}`,
                data:data
            })
        }
        else
        {
            res.status(404).send("Unable to fetch marketplace data.")
        }
    }
    catch(err)
    {
        res.status(500).json({
            message:"Unable to Fetch Data",
            details:err && (err as any).message?(err as any).message:err
        })
    }
}

export const getAllMarketplaceFromChain = async (req: Request, res: Response) => {
    try{
        const data=await getAllMarketplaceDataFromBlockChain();
        if(data)
        {
            res.status(200).json({
                message:`All Registered Marketplaces`,
                data:data
            })
        }
    }
    catch(err)
    {
        console.log('getAllMarketplaceFromChain::', err)
        res.status(500).json({
            message:"Unable to Fetch Data",
            details:err && (err as any).message?(err as any).message:err
        })
    }
}

export const getMarketplaceByIdFromChain = async (req: Request, res: Response) => {
    const id=req.params.id as any;
    try{
        const data=await getMarketplaceDataByIdFromBlockChain(id);
        if(data)
        {
            res.status(200).json({
                message:`Marketplace data for Id: ${id}`,
                data:data
            })
        }
        else
        {
            res.status(404).send("Unable to fetch marketplace data.")
        }
    }
    catch(err)
    {
        res.status(500).json({
            message:"Unable to Fetch Data",
            details:err && (err as any).message?(err as any).message:err
        })
    }
}

export const setCommissionFee= async (req: Request, res: Response) => {
    const {mpId,commission_fee}=req.body;
    const seed=getSeedFromRequest(req);
    try{
        const sender=await getUserFromSeed(seed);
        await setCommissionFeeService(mpId,commission_fee,sender);
        res.status(200).json({
             message:`Marketplace of Id:${mpId}'s commission updated to: ${commission_fee}`
        })
    }
    catch(err){
          res.status(500).json({
            message:`Unable to update commission fee on marketplace with Id:${mpId}.`,
            details:err && (err as any).message?(err as any).message:err
        })
    }
}

export const setOwnerForMarketPlace= async (req: Request, res: Response) => {
    const {mpId,owner}=req.body;
    const seed=getSeedFromRequest(req);
    try{
        const sender=await getUserFromSeed(seed);
        await setOwnerService(mpId,owner,sender);
        res.status(200).json({
             message:`Marketplace of Id:${mpId}'s trasfered to: ${owner}`
        })
    }
    catch(err){
          res.status(500).json({
            message:`Unable to update owner of marketplace with Id:${mpId}.`,
            details:err && (err as any).message?(err as any).message:err
        })
    }
}

export const setKindForMarketPlace= async (req: Request, res: Response) => {
    const {mpId,kind}=req.body;
    const seed=getSeedFromRequest(req);
    try{
        const sender=await getUserFromSeed(seed);
        await setKindService(mpId,kind,sender);
        res.status(200).json({
             message:`Marketplace of Id:${mpId}'s kind changed to: ${kind}`
        })
    }
    catch(err){
          res.status(500).json({
            message:`Unable to update kind of marketplace with Id:${mpId}.`,
            details:err && (err as any).message?(err as any).message:err
        })
    }
}

export const setNameForMarketPlace= async (req: Request, res: Response) => {
    const {mpId,name}=req.body;
    const seed=getSeedFromRequest(req);
    try{
        const sender=await getUserFromSeed(seed);
        await setNameService(mpId,name,sender);
        res.status(200).json({
             message:`Marketplace of Id:${mpId}'s name changed to: ${name}`
        })
    }
    catch(err){
          res.status(500).json({
            message:`Unable to update name of marketplace with Id:${mpId}.`,
            details:err && (err as any).message?(err as any).message:err
        })
    }
}

export const setUriForMarketPlace= async (req: Request, res: Response) => {
    const {mpId,uri}=req.body;
    const seed=getSeedFromRequest(req);
    try{
        const sender=await getUserFromSeed(seed);
        await setUriService(mpId,uri,sender);
        res.status(200).json({
             message:`Marketplace of Id:${mpId}'s uri changed to: ${uri}`
        })
    }
    catch(err){

          res.status(500).json({
            message:`Unable to update uri of marketplace with Id:${mpId}.`,
            details:err && (err as any).message?(err as any).message:err
        })
    }
}

export const setlogoUriForMarketPlace= async (req: Request, res: Response) => {
    const {mpId,logoUri}=req.body;
    const seed=getSeedFromRequest(req);
    try{
        const sender=await getUserFromSeed(seed);
        await setlogoUriService(mpId,logoUri,sender);
        res.status(200).json({
            message:`Marketplace of Id ChangedId:${mpId}'s logouri changed to: ${logoUri}`
        })
    }
    catch(err){
          res.status(500).json({
            message:`Unable to update logouri of marketplace with Id:${mpId}.`,
            details:err && (err as any).message?(err as any).message:err
        })
    }
}