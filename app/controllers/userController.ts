import {Request,Response} from 'express'

import { mnemonicGenerate as mnGenerate, cryptoWaitReady } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';

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

