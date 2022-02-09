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
    nftTransfer
} from "../controllers/nftController";

import { validationMiddleware } from "../validation";
import { createNewNftSchema ,encryptAndUploadMediaSchema,decryptNftSchema, nftTransferScehma, unlistNftSchema,nftMintSchema,uploadNFTJsonSchema,
    getNftDataSchema, nftBurnSchema, getNftIdBySeriesSchema,serieLockSchema,nftSaleSchema,getNftDataByOwnerScehma,nftBatchShema} from "../validation/nft.validation";
import { balanceCheckMiddleware } from '../middleware/balance';
import { checkNftOwnershipMiddleware,checkNFTNotCapsuleMiddleware, checkPrivateKeyExistance, checkNftNotBurntMiddleware, checkNFTNotListedMiddleware, checkNftListedMiddleware,CheckPreviewFile, checkSerieLockedMiddleWare,checkSerieinDraftMiddleWare} from '../middleware/nft';
import { contextSetterMiddleware } from '../middleware/common';

const nftRouter = Router();


nftRouter.post("/api/encryptAndUploadMedia",validationMiddleware(encryptAndUploadMediaSchema), encryptAndUploadMedia);
nftRouter.post("/api/mintNFT",validationMiddleware(nftMintSchema),checkSerieLockedMiddleWare,balanceCheckMiddleware(txPallets.nfts, txActions.create),checkPrivateKeyExistance, mintNFT);
nftRouter.post("/api/createNewNFT", validationMiddleware(createNewNftSchema),checkSerieLockedMiddleWare, balanceCheckMiddleware(txPallets.nfts, txActions.create),CheckPreviewFile,createNewNFT);
nftRouter.post("/api/burnNft/:nftId",validationMiddleware(nftBurnSchema),contextSetterMiddleware, balanceCheckMiddleware(txPallets.nfts, txActions.burn),checkNftOwnershipMiddleware,checkNFTNotCapsuleMiddleware,checkNftNotBurntMiddleware, burnNft);
nftRouter.post("/api/burnNftBatch",validationMiddleware(nftBatchShema),balanceCheckMiddleware(txPallets.nfts, txActions.burn), burnNftBatch);
nftRouter.post("/api/uploadNFTJson",validationMiddleware(uploadNFTJsonSchema), uploadNFTJson);
nftRouter.post("/api/NftSale",validationMiddleware(nftSaleSchema),checkSerieinDraftMiddleWare,contextSetterMiddleware, balanceCheckMiddleware(txPallets.marketplace, txActions.list),checkNftOwnershipMiddleware,checkNFTNotCapsuleMiddleware,checkNftNotBurntMiddleware, checkNFTNotListedMiddleware, NftSale);
nftRouter.post("/api/nft/unlist", validationMiddleware(unlistNftSchema),checkSerieinDraftMiddleWare,contextSetterMiddleware, balanceCheckMiddleware(txPallets.nfts, txActions.unlist),checkNftOwnershipMiddleware,checkNftListedMiddleware, NftUnlist);
nftRouter.post("/api/serie/lock",validationMiddleware(serieLockSchema),checkSerieLockedMiddleWare, balanceCheckMiddleware(txPallets.nfts, txActions.finishSeries), serieLock);
nftRouter.post("/api/nft/decrypt/:id", validationMiddleware(decryptNftSchema),contextSetterMiddleware, checkNftOwnershipMiddleware,checkNftNotBurntMiddleware, decryptNft);
nftRouter.post("/api/nftTransfer", validationMiddleware(nftTransferScehma),checkSerieinDraftMiddleWare,balanceCheckMiddleware(txPallets.nfts, txActions.transfer),checkNftOwnershipMiddleware,checkNftNotBurntMiddleware,nftTransfer);
nftRouter.get("/api/nft/:id",validationMiddleware(getNftDataSchema), getNftDataFromIndexer);
nftRouter.get("/api/getNFTsByOwner/:ownerAddress", validationMiddleware(getNftDataByOwnerScehma),getNFTsByOwner);
nftRouter.get("/api/getNftIdBySeries", validationMiddleware(getNftIdBySeriesSchema), getNftIdBySeries);

export default nftRouter;