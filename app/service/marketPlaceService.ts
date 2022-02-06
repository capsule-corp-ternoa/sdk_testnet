import  type  from '@polkadot/util/types';
import { getApi } from './blockchain.service';

export const OpenMarketPlace = (name:string, commission_fee:any,kind:any,uri=null,logoUri=null,user:any) => {
    //console.log(type)
    return new Promise(async (resolve, reject) => {
        try{
            const unsub = await (await getApi()).tx.marketplace.create(name,commission_fee,kind,uri,logoUri).signAndSend(user, ({
                events = [],
                status = { isInBlock: false }
            }) => {
                if (status.isInBlock){
                    events.forEach(async ({
                        event
                    }) => {
                        const {
                            data,
                            method,
                            section
                        } = event;
                        //console.log('`${section}.${method}`',`${section}.${method}`)
                        if (`${section}.${method}` === 'capsules.CapsuleRemoved') {
                            //@ts-ignore
                            const nftId = data[0].toString()
                            resolve({nftId});
                            unsub();
                        } else if(`${section}.${method}`=='system.ExtrinsicFailed'){
                            reject(`Could not create the NFT in blockchain: details: ${data}`);
                            unsub();
                        }
                    });
                }
            });
        }catch(err){
            //console.log("we cought Error here")
            //console.log('createNft err', err)
            reject()
        }
    });
}