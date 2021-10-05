const controller = require("../controllers/general.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
/*
  Upload images to IPFS server
  */
 app.post("/api/uploadIM", controller.uploadIM);
  /*
  Generate mnemonic and public address
  */
  app.get("/api/mnemonicGenerate", controller.mnemonicGenerate);

  /*
  Protect file using pgp
  */
  app.post("/api/encryptAndUploadMedia", controller.encryptAndUploadMedia);
  

  // /*
  // Upload JSON file to IPFS 
  // */
  app.post("/api/uploadNFTJson", controller.uploadNFTJson);

  // /*
  // Send signature to Server
  // */
  app.post("/api/saveShamirForNFT", controller.saveShamirForNFT);

  /*
get NFT data by id
 */
  app.get("/api/nft/:id", controller.getNftData);

};