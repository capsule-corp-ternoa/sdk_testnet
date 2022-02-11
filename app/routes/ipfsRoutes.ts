
import { Router } from 'express'
import {
  uploadIM,
} from "../controllers/ipfsController";

import { validationMiddleware } from "../validation";
import { uploadImSchema } from "../validation/ipfs.validation";
const ipfsRouter = Router();
ipfsRouter.post("/api/ipfs/upload",validationMiddleware(uploadImSchema), uploadIM);

export default ipfsRouter;