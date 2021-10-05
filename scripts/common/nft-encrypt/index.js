const crypto = require('crypto');
const gen = require('random-seed');
const openpgp = require('openpgp');
const mime = require('mime-types')
const {
  v4: uuid
} = require('uuid');
const {
  TernoaIpfsApi
} = require('../../../app/helpers/ipfs.helper');
const {
  streamToBuffer,
  contentToStream,
  getStreamFilename,
  deleteFile
} = require('..');
const { createReadStream } = require('fs');

const ipfsApi = new TernoaIpfsApi();

exports.generateSeriesId = (fileHash) => {
  const serieGen = gen.create(fileHash)
  const serieId = serieGen.intBetween(0, 4294967295)
  return serieId
}
exports.getFileHash = (stream) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const input = createReadStream(stream.path);
    input.on('error', () => {
      reject();
    });

    input.on('data', (chunk) => {
      hash.update(chunk);
    });

    input.on('close', () => {
      const fileHash = hash.digest('hex');
      resolve(fileHash);
    });
  });
}

const cryptFilePgp = async (file, publicPGP) => {
  const buffer = await streamToBuffer(file);
  const content = buffer.toString("base64");
  const message = await openpgp.createMessage({
    text: content
  });
  const publicKey = await openpgp.readKey({
    armoredKey: publicPGP
  })
  const encrypted = await openpgp.encrypt({
    message,
    encryptionKeys: [publicKey],
  });
  return encrypted
}
const uploadIPFS = async (stream) => {
  try {
    const filename = getStreamFilename(stream)
    const mediaType = mime.lookup(filename);
    const result = await ipfsApi.addFile(stream);
    if (result && result.Hash) {
      return {
        url: ipfsApi.getIpfsFullLink(result.Hash),
        mediaType
      };
    } else {
      throw new Error('Hash not retrieved from IPFS');
    }

  } catch (err) {
    throw err
  }
};

exports.cryptData = async (data, publicPGP) => {
  const message = await openpgp.createMessage({
    text: data
  });
  const publicKey = await openpgp.readKey({
    armoredKey: publicPGP
  })
  const encrypted = await openpgp.encrypt({
    message,
    encryptionKeys: [publicKey],
  });
  return encrypted
}

exports.uploadIPFS = uploadIPFS;
exports.cryptAndUploadNFT = async (secretNFT, publicPGP) => {
  return new Promise(async (resolve, reject) => {
    try {
      //NFT Data
      const encryptedSecretNft = await cryptFilePgp(secretNFT, publicPGP);
      const secretFileName = getStreamFilename(secretNFT);
      const secretNFTType = mime.lookup(secretFileName);
      const pgpPath = `./tmp/pgp-public-key_${uuid()}.txt`;
      const pgpFile = contentToStream(publicPGP, pgpPath);
      const encryptedPath = `./tmp/${uuid()}_${secretFileName}`;
      const encryptedFile = contentToStream(encryptedSecretNft, encryptedPath);
      const [encryptedUploadResponse, pgpUploadResponse] = await Promise.all([
        uploadIPFS(encryptedFile),
        uploadIPFS(pgpFile),
      ])
      resolve([encryptedUploadResponse, pgpUploadResponse])
      deleteFile(encryptedPath)
      deleteFile(pgpPath)
    } catch (err) {
      reject(err)
    }
  })
}
exports.generateAndUploadNftJson = (name, description, seriesId, previewUrl, mediaType, encryptedMediaUrl, encryptedMediaType, publicPGPUrl) => {
  const data = {
    seriesId: seriesId || 0,
    name,
    description,
    publicPGP: publicPGPUrl,
    media: {
      url: previewUrl,
      mediaType: mediaType
    },
    cryptedMedia: {
      url: encryptedMediaUrl,
      cryptedMediaType: encryptedMediaType,
    },
  }
  const nftJsonFile = contentToStream(JSON.stringify(data), `nft_${uuid()}.json`)
  return uploadIPFS(nftJsonFile);
}


exports.generatePgp = () => openpgp.generateKey({
  type: 'rsa',
  rsaBits: 2048,
  userIDs: [{
    name: 'john doe',
    email: 'johndoe@ternoa.com',
  }]
});