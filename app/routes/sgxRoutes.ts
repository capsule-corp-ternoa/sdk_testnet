
import {
  saveShamirForNFT,
} from "../controllers/sgxController";
import { Router } from 'express';
import { saveSSSAToSGXSchema } from "../validation/sgx.validation";
import { validationMiddleware } from "../validation";
const sgxRouter = Router();

sgxRouter.post("/api/tee/nft/save-shamirs",validationMiddleware(saveSSSAToSGXSchema), saveShamirForNFT);
export default sgxRouter;