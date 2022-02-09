import { Request, Response } from 'express'
import { createMarketPlaceService ,getMarketplaceDataByOwner as ownerDataforMp,getMarketplaceDataById,getMarketplaceDataByIdFromBlockChain} from '../service/marketPlaceService';


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
            details:`${err}`
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
            Details:err
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
            Details:err
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
            Details:err
        })
    }
}
