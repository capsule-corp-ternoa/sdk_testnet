import * as fs  from 'fs';
import {Request,Response} from 'express'
import { getSgxNodes,saveSSSAToSGX } from '../service/sgxService';
import { getUserFromSeed } from '../service/blockchain.service';
import { getSeedFromRequest } from '../helpers';

export const saveShamirForNFT = async (req:Request, res:Response) => {
  const { nftId, privateKeyFilePath} = req.body as any;
  const seed=getSeedFromRequest(req);
  try {
    await getSgxNodes();
    const sender = await getUserFromSeed(seed);
    const privateKey = fs.readFileSync(privateKeyFilePath) as any;
    const sgxResponse = await saveSSSAToSGX(privateKey, nftId, sender);
    res.status(200).json({
      Message:`Shamir Saved to Sgx!.`,
      Data:sgxResponse
    });
  } 
  catch (err) {
    res.status(500).json({ 
      message: 'Unable to Save shamir to Sgx.', 
      details:err && (err as any).message?(err as any).message:err
    });
  }
}

