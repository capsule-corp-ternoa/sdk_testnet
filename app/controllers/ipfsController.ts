import { v4 as uuid } from 'uuid';
import {Request,Response} from 'express'
import { UploadedFile } from 'express-fileupload';
import { uploadImService} from '../service/ipfsService';

import { 
  getFilePath,
} from '../../common';

export const uploadIM = async (req:Request, res:Response) => {
  let file=req.files?.file as UploadedFile;
  const fileName = `${uuid()}_${file.name}`;
  const destPath = getFilePath(fileName);
  try {
    const move= await file.mv(destPath)//, async function (err) {if (err) {throw err;}});
    const Ipfsdata =await uploadImService(fileName);
    res.status(200).json({
      Message:`File Successfully Uploaded to Ipfs.`,
      Data:{Ipfsdata}
    });
  }
  catch (err) {    
    console.log('uploadIM err', err)
    res.status(500).json({ 
        message: 'Unable to Upload File to Ipfs.', 
        details:err
      });
  }
};