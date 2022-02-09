
import { Router } from "express";
import { txActions, txPallets } from '../const/tx.const';
import {
  capsuleItemEncrypt,
  uploadCapsuleJson,
  addFileToCapsule,
  nftToCapsule,
  CapsuleToNft,
  createCapsule,
  CapsuleItems,
  setIpfsReference,
  getCapsuleMetadata,
  removeFileFromCapsule
} from "../controllers/capsuleController";
import { validationMiddleware } from "../validation";
import { setIpfsReferenceSchema,uploadCapsuleJsonSchema,capsuleCreateSchema,removeFileFromCapsuleSchema,capsuleRemoveSchema,addFileToCapsuleschema,capsuleCommonSchema,nftToCapsuleSchema,capsuleItemEncryptSchema} from "../validation/capsule.validation";
import { balanceCheckMiddleware } from '../middleware/balance';
import { checkNftOwnershipMiddleware,checkNFTCapsuleMiddleware,checkNFTNotCapsuleMiddleware } from '../middleware/nft';
import { contextSetterMiddleware } from '../middleware/common';
import {validateUploadCapsuleJsonMiddleware} from '../middleware/capsule';
const capsuleRouter = Router();

capsuleRouter.post("/api/capsuleItemEncrypt/:nftId",validationMiddleware(capsuleItemEncryptSchema), capsuleItemEncrypt);
capsuleRouter.post("/api/getCapsuleMetadata/:nftId",validationMiddleware(capsuleCommonSchema), getCapsuleMetadata);
capsuleRouter.post("/api/uploadCapsuleJson",validationMiddleware(uploadCapsuleJsonSchema), validateUploadCapsuleJsonMiddleware,uploadCapsuleJson);
capsuleRouter.post("/api/addFileToCapsule/:nftId",validationMiddleware(addFileToCapsuleschema),contextSetterMiddleware, balanceCheckMiddleware(txPallets.capsules, txActions.setIpfsReference),checkNftOwnershipMiddleware,checkNFTCapsuleMiddleware,addFileToCapsule);
capsuleRouter.post("/api/nftToCapsule", validationMiddleware(nftToCapsuleSchema),contextSetterMiddleware, balanceCheckMiddleware(txPallets.capsules, txActions.createFromNft),checkNFTNotCapsuleMiddleware,checkNftOwnershipMiddleware, nftToCapsule);
capsuleRouter.post("/api/CapsuleToNft/:nftId",validationMiddleware(capsuleRemoveSchema),contextSetterMiddleware, balanceCheckMiddleware(txPallets.capsules, txActions.remove),checkNFTCapsuleMiddleware,checkNftOwnershipMiddleware,CapsuleToNft);
capsuleRouter.post("/api/createCapsule",validationMiddleware(capsuleCreateSchema), balanceCheckMiddleware(txPallets.capsules, txActions.create),createCapsule);
capsuleRouter.post("/api/setIpfsReference",validationMiddleware(setIpfsReferenceSchema), contextSetterMiddleware, balanceCheckMiddleware(txPallets.capsules, txActions.setIpfsReference),checkNftOwnershipMiddleware,checkNFTCapsuleMiddleware, setIpfsReference);
capsuleRouter.post("/api/CapsuleItems/:nftId",validationMiddleware(capsuleCommonSchema), CapsuleItems);
capsuleRouter.post("/api/removeCapsuleItem/:nftId", validationMiddleware(removeFileFromCapsuleSchema),contextSetterMiddleware, balanceCheckMiddleware(txPallets.capsules, txActions.setIpfsReference),checkNFTCapsuleMiddleware,checkNftOwnershipMiddleware, removeFileFromCapsule);

export default capsuleRouter;
