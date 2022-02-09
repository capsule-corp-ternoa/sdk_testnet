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

export const getMarketplaceDataByIdFromBlockChain=async (id:number)=>{
    try{
        const marketPlaceData=JSON.parse(JSON.stringify(await (await getApi()).query.marketplace.marketplaces(id)))
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

export const setCommissionFeeService=async(mpId:any,commission_fee:any,sender:any)=>{
    try{
        await runTransaction(txPallets.marketplace, txActions.setCommissionFee, sender, [mpId, commission_fee], false,'marketplace.MarketplaceCommissionFeeChanged')
    }
    catch(err)
    {
        throw err;
    }
     
}
  
export const setOwnerService=async(mpId:any,owner:any,sender:any)=>{
    try{
        await runTransaction(txPallets.marketplace, txActions.setOwner, sender, [mpId, owner], false,'marketplace.MarketplaceChangedOwner')
    }
    catch(err)
    {
        throw err;
    }
}
export const setKindService=async(mpId:any,kind:any,sender:any)=>{
    try{
        await runTransaction(txPallets.marketplace, txActions.setKind, sender, [mpId, kind], false,'marketplace.MarketplaceTypeChanged')
    }
    catch(err)
    {
        throw err;
    }
}

export const setNameService=async(mpId:any,name:any,sender:any)=>{
    try{
        await runTransaction(txPallets.marketplace, txActions.setName, sender, [mpId, name], false,'marketplace.MarketplaceNameChanged')
    }
    catch(err)
    {
        throw err;
    }
  
}
export const setUriService=async(mpId:any,uri:any,sender:any)=>{
    try{
        await runTransaction(txPallets.marketplace, txActions.setUri, sender, [mpId, uri], false,'marketplace.MarketplaceUriUpdated')
    }
    catch(err)
    {
        console.log(err);
        throw err;
    }
}


export const setlogoUriService=async(mpId:any,logoUri:any,sender:any)=>{
    try{
        await runTransaction(txPallets.marketplace, txActions.setLogoUri, sender, [mpId, logoUri], false,'marketplace.MarketplaceLogoUriUpdated')
    }
    catch(err)
    {
        throw err;
    }

}