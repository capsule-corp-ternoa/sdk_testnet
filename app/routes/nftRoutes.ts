import { Router } from 'express'
import { txActions, txPallets } from '../const/tx.const';



import {
    encryptAndUploadMedia,
    mintNFT,
    burnNft,
    burnNftBatch,
    uploadNFTJson,
    getNftDataFromIndexer,
    createNewNFT,
    NftSale,
    getNFTsByOwner,
    serieLock,
    NftUnlist,
    decryptNft,
    getNftIdBySeries,
} from "../controllers/nftController";

import { validationMiddleware } from "../validation";
import { createNewNftSchema ,encryptAndUploadMediaSchema,decryptNftSchema,  unlistNftSchema,nftMintSchema,uploadNFTJsonSchema,
    getNftDataSchema, nftBurnSchema, getNftIdBySeriesSchema,serieLockSchema,nftSaleSchema,getNftDataByOwnerScehma,nftBatchShema} from "../validation/nft.validation";
import { balanceCheckMiddleware } from '../middleware/balance';
import { checkNftOwnershipMiddleware, checkNFTNotCapsuleMiddleware, checkPrivateKeyExistance, checkNftNotBurntMiddleware, checkNFTNotListedMiddleware, checkNftListedMiddleware,CheckPreviewFile} from '../middleware/nft';
import { contextSetterMiddleware } from '../middleware/common';

const nftRouter = Router();


nftRouter.post("/api/encryptAndUploadMedia",validationMiddleware(encryptAndUploadMediaSchema), encryptAndUploadMedia);
nftRouter.post("/api/mintNFT",validationMiddleware(nftMintSchema),balanceCheckMiddleware(txPallets.nfts, txActions.create),checkPrivateKeyExistance, mintNFT);
nftRouter.post("/api/createNewNFT", validationMiddleware(createNewNftSchema), balanceCheckMiddleware(txPallets.nfts, txActions.create),CheckPreviewFile,createNewNFT);
nftRouter.post("/api/burnNft/:nftId",validationMiddleware(nftBurnSchema),contextSetterMiddleware, balanceCheckMiddleware(txPallets.nfts, txActions.burn),checkNftOwnershipMiddleware,checkNFTNotCapsuleMiddleware,checkNftNotBurntMiddleware, burnNft);
nftRouter.post("/api/burnNftBatch",validationMiddleware(nftBatchShema),balanceCheckMiddleware(txPallets.nfts, txActions.burn), burnNftBatch);
nftRouter.post("/api/uploadNFTJson",validationMiddleware(uploadNFTJsonSchema), uploadNFTJson);
nftRouter.post("/api/NftSale",validationMiddleware(nftSaleSchema),contextSetterMiddleware, balanceCheckMiddleware(txPallets.marketplace, txActions.list),checkNftOwnershipMiddleware,checkNFTNotCapsuleMiddleware,checkNftNotBurntMiddleware, checkNFTNotListedMiddleware, NftSale);
nftRouter.post("/api/nft/unlist/:id", validationMiddleware(unlistNftSchema),contextSetterMiddleware, balanceCheckMiddleware(txPallets.nfts, txActions.unlist),checkNftOwnershipMiddleware,checkNftListedMiddleware, NftUnlist);
nftRouter.post("/api/serie/lock",validationMiddleware(serieLockSchema), balanceCheckMiddleware(txPallets.nfts, txActions.finishSeries), serieLock);
nftRouter.post("/api/nft/decrypt/:id", validationMiddleware(decryptNftSchema),contextSetterMiddleware, checkNftOwnershipMiddleware,checkNftNotBurntMiddleware, decryptNft);
nftRouter.get("/api/nft/:id",validationMiddleware(getNftDataSchema), getNftDataFromIndexer);
nftRouter.get("/api/getNFTsByOwner/:ownerAddress", validationMiddleware(getNftDataByOwnerScehma),getNFTsByOwner);
nftRouter.get("/api/getNftIdBySeries", validationMiddleware(getNftIdBySeriesSchema), getNftIdBySeries);

export default nftRouter;