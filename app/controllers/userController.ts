import {Request,Response} from 'express'

import { mnemonicGenerate as mnGenerate, cryptoWaitReady } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
import { getSeedFromRequest } from '../helpers';
import { TransferCapsandKeepAlive as transferKeepAlive } from '../service/userService';
import { getUserFromSeed, unFormatBalance } from '../service/blockchain.service';
import { send } from 'process';
import { json } from 'stream/consumers';

export const mnemonicGenerate = async (req:Request, res:Response) => {
  await cryptoWaitReady();
  const keyring = new Keyring({
    type: 'sr25519',
  });
  const mnemonic = mnGenerate();
  const newAccount =keyring.addFromUri(mnemonic);

  let account = {
    mnemonic: mnemonic,
    address: newAccount.address,
  };

  res.setHeader('Content-Type', 'application/json');

  /* Return new account details */
  res.send(JSON.stringify(account));
};

export const TransferCapsandKeepAlive = async (req:Request, res:Response) => {
  //TODO:balance check with value to send
    const {recieverAddress,value}=req.body;
    const seed=getSeedFromRequest(req);
    try{
      if(value<=0){
        res.status(400).json({
          message:`value needs to be greater than 0`
        })
      }
      const sender=await getUserFromSeed(seed) as any;
      const data=await transferKeepAlive(recieverAddress,unFormatBalance(value),sender)
      res.status(200).json({Message:"Caps Transfered!"})
    }
    catch(err)
    {
      res.status(500).json({
        message:`Unable to transfer Caps to account with Id: ${recieverAddress}.`,
        details:err && (err as any).message?(err as any).message:err
      })
    }
}