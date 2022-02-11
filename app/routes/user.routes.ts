
import {
  mnemonicGenerate,
  TransferCapsandKeepAlive
} from "../controllers/userController"
import { Router } from 'express'
import { validationMiddleware } from "../validation";
import { mnemonicGenerateSchema,transferCapsSchema } from "../validation/user.validation";

const userRouter = Router();
/*
  Upload images to IPFS server
  */
/*
Generate mnemonic and public address
*/
userRouter.get("/api/mnemonicGenerate",validationMiddleware(mnemonicGenerateSchema), mnemonicGenerate);
userRouter.post("/api/balances/transferCaps",validationMiddleware(transferCapsSchema), TransferCapsandKeepAlive);

// /*
// Upload JSON file to IPFS 
// */

// /*
// Send signature to Server
// */




/*
get NFT data by id
*/






// app.post("/api/nftMint",controller.NftMint);

export default userRouter;