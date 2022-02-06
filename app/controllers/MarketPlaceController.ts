import { Request, Response } from 'express'
import { OpenMarketPlace } from '../service/marketPlaceService';


import { 
    getUserFromSeed 
} from '../service/blockchain.service';
import { getSeedFromRequest } from '../helpers';

export const createMarketPlace = async (req: Request, res: Response) => {
    const { name, commission_fee, kind, uri, logoUri } = req.body;
    const seed = getSeedFromRequest(req);
    try {
        const sender = await getUserFromSeed(seed);
        const data=await OpenMarketPlace(name, commission_fee, kind, uri, logoUri, sender);
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

        
