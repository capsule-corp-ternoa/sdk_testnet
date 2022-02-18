
import { Router } from 'express'
import {
  uploadIM,
} from "../controllers/ipfsController";
import { checkMimeType ,fileSizeCheck} from '../middleware/common';

import { validationMiddleware } from "../validation";
import { uploadImSchema } from "../validation/ipfs.validation";
const ipfsRouter = Router();
ipfsRouter.post("/api/ipfs/upload",validationMiddleware(uploadImSchema),checkMimeType,fileSizeCheck, uploadIM);

export default ipfsRouter;