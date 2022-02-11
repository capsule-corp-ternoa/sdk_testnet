import { getApi,runTransaction } from './blockchain.service';
import { txActions, txEvent, txPallets } from '../const/tx.const';
import {  getChainPrice, getUserFromSeed,  } from './blockchain.service';
export const TransferCapsandKeepAlive=async (recieverAddress:any,value:any,user:any) => 
{
   try{
       const { event, data } = await runTransaction(txPallets.balances, txActions.transferKeepAlive, user, [recieverAddress, value], false, 'system.ExtrinsicSuccess')
       return data;
    }
    catch(err){
        throw err
    }
}
    