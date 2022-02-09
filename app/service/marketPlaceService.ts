import  type  from '@polkadot/util/types';
import { getApi,runTransaction } from './blockchain.service';
import { txActions, txEvent, txPallets } from '../const/tx.const';
import { getMpByOwner,getMpById } from './ternoa.indexer';
export const createMarketPlaceService=async (name:string, commission_fee:any,kind:any,uri=null,logoUri=null,user:any) => 
{
    try{
        const { event, data } = await runTransaction(txPallets.marketplace, txActions.create, user, [kind, commission_fee,name,uri,logoUri], false, txEvent.MarketplaceCreated)
        const nftId = data[0].toString();
        return nftId;
    }
    catch(err){
        throw err
    }
}

export const getMarketplaceDataByOwner=async (ownerAddress:string)=>{
    try{
        const marketPlaceData=await getMpByOwner(ownerAddress);
        if(marketPlaceData)
        {
            return marketPlaceData;
        }
        else
        {
            return null;
        }
    }
    catch(err){
        throw err;
    }
    
}

export const getMarketplaceDataById=async (id:number)=>{
    try{
        const marketPlaceData=await getMpById(id);
        if(marketPlaceData)
        {
            return marketPlaceData;
        }
        else
        {
            return null;
        }
    }
    catch(err){
        throw err;
    }
    
}