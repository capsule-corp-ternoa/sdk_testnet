
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
import { setIpfsReferenceSchema,uploadCapsuleJsonSchema,capsuleCreateSchema,getCapsuleItemsSchema,removeFileFromCapsuleSchema,capsuleRemoveSchema,addFileToCapsuleschema,capsuleCommonSchema,nftToCapsuleSchema,capsuleItemEncryptSchema} from "../validation/capsule.validation";
import { balanceCheckMiddleware } from '../middleware/balance';
import { checkNftOwnershipMiddleware,checkNFTCapsuleMiddleware,checkNFTNotCapsuleMiddleware } from '../middleware/nft';
import { contextSetterMiddleware } from '../middleware/common';
import {validateUploadCapsuleJsonMiddleware} from '../middleware/capsule';
const capsuleRouter = Router();

capsuleRouter.post("/api/capsule/media/encrypt-item",validationMiddleware(capsuleItemEncryptSchema), capsuleItemEncrypt);
capsuleRouter.post("/api/capsule/media/upload-json",validationMiddleware(uploadCapsuleJsonSchema), validateUploadCapsuleJsonMiddleware,uploadCapsuleJson);
capsuleRouter.post("/api/capsule/file/add",validationMiddleware(addFileToCapsuleschema),contextSetterMiddleware, balanceCheckMiddleware(txPallets.capsules, txActions.setIpfsReference),checkNftOwnershipMiddleware,checkNFTCapsuleMiddleware,addFileToCapsule);
capsuleRouter.post("/api/capsule/file/remove", validationMiddleware(removeFileFromCapsuleSchema),contextSetterMiddleware, balanceCheckMiddleware(txPallets.capsules, txActions.setIpfsReference),checkNFTCapsuleMiddleware,checkNftOwnershipMiddleware, removeFileFromCapsule);
capsuleRouter.post("/api/capsule/convert-from-nft", validationMiddleware(nftToCapsuleSchema),contextSetterMiddleware, balanceCheckMiddleware(txPallets.capsules, txActions.createFromNft),checkNFTNotCapsuleMiddleware,checkNftOwnershipMiddleware, nftToCapsule);
capsuleRouter.post("/api/capsule/convert-to-nft",validationMiddleware(capsuleRemoveSchema),contextSetterMiddleware, balanceCheckMiddleware(txPallets.capsules, txActions.remove),checkNFTCapsuleMiddleware,checkNftOwnershipMiddleware,CapsuleToNft);
capsuleRouter.post("/api/capsule/create",validationMiddleware(capsuleCreateSchema), balanceCheckMiddleware(txPallets.capsules, txActions.create),createCapsule);
capsuleRouter.post("/api/capsule/set-ipfs-reference",validationMiddleware(setIpfsReferenceSchema), contextSetterMiddleware, balanceCheckMiddleware(txPallets.capsules, txActions.setIpfsReference),checkNftOwnershipMiddleware,checkNFTCapsuleMiddleware, setIpfsReference);

capsuleRouter.get("/api/capsule/items/:nftId",validationMiddleware(getCapsuleItemsSchema), CapsuleItems);
capsuleRouter.get("/api/capsule/metadata/:nftId",validationMiddleware(getCapsuleItemsSchema), getCapsuleMetadata);


export default capsuleRouter;
