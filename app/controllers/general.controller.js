//General libraries
const fs = require('fs');
const { mnemonicGenerate } = require('@polkadot/util-crypto');
const { Keyring } = require('@polkadot/keyring');
const { v4: uuid } = require('uuid');
const { getNftById } = require('../service/ternoa.indexer');
const { generatePgp, cryptAndUploadNFT, getFileHash, generateSeriesId, generateAndUploadNftJson, uploadIPFS } = require('../../scripts/common/nft-encrypt');
const { sssaGenerate, SSSA_THRESHOLD } = require('../../scripts/sssa');
const { getUserFromSeed } = require('../../scripts/common/chain');
const { getSgxNodeApi, getSgxNodes } = require('../../scripts/sgx');
const localTempFolder = process.env.LOCAL_TEMP_FOLDER || './tmp/';
const localKeysFolder = process.env.LOCAL_KEYS_FOLDER || './nftKeys/';
const shamirPath = process.env.SHAMIR_PATH || './faildShamirs';

/******************
 * FILE HELPER FUNCTIONS
 ******************/

const getFilePath = (fileName) => `${localTempFolder}${fileName}`;
const getFileStreamFromName = (fileName) => getFile(getFilePath(fileName));
const getFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    return fs.createReadStream(filePath);
  } else {
    throw new Error(`File not found at ${filePath}`);
  }
};

const getHashFromLink = (link) => {
  const splits = link.split('/');
  return splits[splits.length - 1];
};

const onShamirFailed = (error) => {
  try {
    const { data, nftId, sgxApiUrl } = error;
    if (nftId && data && sgxApiUrl) {
      const sgxNodeUrlBuffer = Buffer.from(sgxApiUrl);
      const sgxNodeUrlEncoded = sgxNodeUrlBuffer.toString('base64');
      const dirPath = `${shamirPath}/${sgxNodeUrlEncoded}`;
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }
      fs.writeFile(`${dirPath}/${nftId}`, data, () => {
        console.info(`shamir locally saved to ${dirPath}/${nftId}`);
      });
    } else {
      console.error("Can't store shamir locally due to missing info.");
    }
  } catch (e) {
    console.error('Missing data - e:' + e);
    throw new Error('Shamir local save failed');
  }
};
const saveSSSAToSGX = async (privateKey, nftId, sender) => {
  const pubKey = sender.address;
  const sssaShares = sssaGenerate(privateKey);
  const sgxResponses = await Promise.all(
    sssaShares.map(async (sssaShare, index) => {
      return new Promise(async (resolve, reject) => {
        const sgxNodeApi = await getSgxNodeApi(index);
        sgxNodeApi
          .saveShamir(sssaShare, nftId, pubKey, sender)
          .catch((e) => {
            reject(e);
            onShamirFailed(e);
          })
          .then(resolve);
      });
    }),
  );
  const validSgxResponses = sgxResponses.filter((result) => !(result instanceof Error));
  console.log('valid SGX requests:' + validSgxResponses.length);
  if (validSgxResponses.length >= SSSA_THRESHOLD) {
    return sgxResponses;
  } else {
    throw new Error('Not enough shamirs were saved to SGX Nodes');
  }
};
/////
// Generate mnemonic
/////

exports.mnemonicGenerate = async (req, res) => {
  const keyring = new Keyring({
    type: 'sr25519',
  });
  const mnemonic = mnemonicGenerate();
  const newAccount = await keyring.addFromUri(mnemonic);

  let account = {
    mnemonic: mnemonic,
    address: newAccount.address,
  };

  res.setHeader('Content-Type', 'application/json');

  /* Return new account details */
  res.send(JSON.stringify(account));
};

/////
// Upload image to ipfs
/////

exports.uploadIM = async (req, res) => {
  const file = req.files.file;
  if (!file || !['image/jpeg', 'image/png', 'image/gif', 'video/mp4'].includes(file.mimetype)) {
    throw new Error('Invalid file type');
  }
  const fileName = `${uuid()}_${file.name}`;
  const destPath = getFilePath(fileName);
  file.mv(destPath, async function (err) {
    if (err) {
      throw err;
    }
    try {
      const mediaFileStream = getFileStreamFromName(fileName);
      const { url: media, mediaType } = await uploadIPFS(mediaFileStream);

      return res.status(200).send(
        JSON.stringify({
          media,
          mediaType,
        }),
      );
    } catch (err) {
      console.log('pinFileToIPFS error:' + err);
      return res.status(500).send(err);
    }
  });
};

/////
// Encrypt and upload file
/////

exports.encryptAndUploadMedia = async (req, res) => {
  const file = req.files.file;
  if (!file || !['image/jpeg', 'image/png', 'image/gif', 'video/mp4'].includes(file.mimetype)) {
    throw new Error('Invalid file type');
  }
  const fileName = `enc_${uuid()}_${file.name}`;
  const destPath = getFilePath(fileName);
  file.mv(destPath, async function (err) {
    if (err) {
      throw err;
    }
    try {
      const secretFileStream = getFileStreamFromName(fileName);
      const pgp = await generatePgp();
      const [{ url: encryptedMedia, mediaType: encryptedMediaType }, { url: publicPgpLink }] = await cryptAndUploadNFT(secretFileStream, pgp.publicKey);
      const fileHash = await getFileHash(secretFileStream);
      const seriesId = generateSeriesId(fileHash);
      console.log('seriesId ok', seriesId);
      const privateKeyFilePath = localKeysFolder + getHashFromLink(encryptedMedia);
      console.log('privateKeyPath', privateKeyFilePath);
      fs.writeFileSync(privateKeyFilePath, pgp.privateKey);

      res.json({
        encryptedMedia,
        encryptedMediaType,
        publicPgpLink,
        seriesId,
        privateKeyFilePath,
      });

      //Clean tmp folder
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
      }
    } catch (err) {
      console.log('err:', err);
      res.status(404).send(err);
    }
  });
};

// /////
// // Generate and upload NFT JSON
// /////

exports.uploadNFTJson = async (req, res) => {
  const { name, description, seriesId, media, mediaType, encryptedMedia, encryptedMediaType, publicPgpLink } = req.body;
  if (!(name && description && seriesId && media && mediaType && encryptedMedia && encryptedMediaType && publicPgpLink)) {
    throw new Error('Missing parameter(s)');
  }
  try {
    const { url } = await generateAndUploadNftJson(name, description, seriesId, media, mediaType, encryptedMedia, encryptedMediaType, publicPgpLink);
    res.json({ offchain_url: url });
  } catch (err) {
    console.error('file write error', err);
    res.status(404).send(err);
  }
};

// /////
// // Save private key on sgx nodes for NFT
// /////
exports.saveShamirForNFT = async (req, res) => {
  const { nftId, privateKeyFilePath, seed } = req.body;

  try {
    await getSgxNodes();
    const sender = await getUserFromSeed(seed);
    const privateKey = fs.readFileSync(privateKeyFilePath);
    console.log('privateKey', privateKey);
    const sgxResponse = await saveSSSAToSGX(privateKey, nftId, sender);
    console.info('nftID- ', nftId, ' - sgxResponse:', sgxResponse);
    res.json({ sgxResponse });
  } catch (err) {
    console.error('saveShamirForNFT error', err);
    res.status(500).send(err);
  }
};

// /////
// // Get details of NFT
// /////
exports.getNftData = async (req, res) => {
  try {
    const { id: nftId } = req.params;
    const nftIndexerData = await getNftById(nftId);
    res.status(200).json(nftIndexerData);
  } catch (e) {
    console.error(e);
    res.status(500).send(`An error has occured.  Details ${e}`);
  }
};
