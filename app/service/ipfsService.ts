import mime from 'mime-types'

import { getStreamFilename } from "../../common";
import TernoaIpfsApi from '../helpers/ipfs.helper';
import { 

        getFileStreamFromName,
} from '../../common';
const ipfsApi = new TernoaIpfsApi();

export const uploadIPFS = async (stream:any) => {
  try {
    const filename = getStreamFilename(stream)
    const mediaType = mime.lookup(filename);
    const result = await ipfsApi.addFile(stream);
    if (result && result.Hash && result.Size) {
      return {
        url: ipfsApi.getIpfsFullLink(result.Hash),
        mediaType,
        IPFSHash:result.Hash,
        size:result.Size
      };
    } else {
      throw new Error('Hash not retrieved from IPFS');
    }

  } catch (err) {
    throw err
  }
};

export const uploadImService= async (fileName:any)=>{
  const mediaFileStream = getFileStreamFromName(fileName);
  const {url,size:mediaSize,IPFSHash:mediaIPFSHash, mediaType} = await uploadIPFS(mediaFileStream);
  return { url,
      mediaType,
      mediaIPFSHash,
      mediaSize
  }
}