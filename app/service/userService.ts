import { getApi,runTransaction } from './blockchain.service';
import { txActions, txEvent, txPallets } from '../const/tx.const';

export const TransferCapsandKeepAlive=async (recieverAddress:any,value:any,user:any) => 
{
    try{
        const { event, data } = await runTransaction(txPallets.balances, txActions.transferKeepAlive, user, [recieverAddress.address, value], false, 'balances.Transfered')
        console.log(data)
        return data;
    }
    catch(err){
        throw err
    }
}