import { NextFunction, Request, Response } from "express";

import { getSeedFromRequest } from "../helpers";
import { getUserFromSeed } from "../service/blockchain.service";
import { getMarketplaceDataByIdFromBlockChain } from "../service/marketPlaceService";

export const checkMpOwnershipMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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
    
}
