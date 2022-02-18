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
    nftTransfer,
    getNftIdBySeriesForOwner
} from "../controllers/nftController";
import { validationMiddleware } from "../validation";
import { createNewNftSchema ,encryptAndUploadMediaSchema,decryptNftSchema, nftTransferScehma, unlistNftSchema,nftMintSchema,uploadNFTJsonSchema,
    getNftDataSchema, nftBurnSchema, getNftIdBySeriesSchema,serieLockSchema,nftSaleSchema,getNftDataByOwnerScehma,nftBatchShema, getNftIdBySeriesForOwnerSchema} from "../validation/nft.validation";
import { balanceCheckMiddleware } from '../middleware/balance';
import { checkNftOwnershipMiddleware,checkNFTNotCapsuleMiddleware, checkPrivateKeyExistance, checkNftNotBurntMiddleware, checkNFTNotListedMiddleware, checkNftListedMiddleware,CheckPreviewFile, checkSerieLockedMiddleWare,checkSerieinDraftMiddleWare} from '../middleware/nft';
import { contextSetterMiddleware ,fileSizeCheck} from '../middleware/common';

const nftRouter = Router();

nftRouter.post("/api/nft/media/encrypt-and-upload",validationMiddleware(encryptAndUploadMediaSchema),fileSizeCheck, encryptAndUploadMedia);
nftRouter.post("/api/nft/upload-json",validationMiddleware(uploadNFTJsonSchema), uploadNFTJson);

nftRouter.post("/api/nft/mint",validationMiddleware(nftMintSchema),checkSerieLockedMiddleWare,balanceCheckMiddleware(txPallets.nfts, txActions.create),checkPrivateKeyExistance, mintNFT);
nftRouter.post("/api/nft/create", validationMiddleware(createNewNftSchema),checkSerieLockedMiddleWare, balanceCheckMiddleware(txPallets.nfts, txActions.create),CheckPreviewFile,createNewNFT);

nftRouter.post("/api/nft/burn",validationMiddleware(nftBurnSchema),contextSetterMiddleware, balanceCheckMiddleware(txPallets.nfts, txActions.burn),checkNftOwnershipMiddleware,checkNFTNotCapsuleMiddleware,checkNftNotBurntMiddleware, burnNft);
nftRouter.post("/api/nft/burn-batch",validationMiddleware(nftBatchShema),balanceCheckMiddleware(txPallets.nfts, txActions.burn), burnNftBatch);
nftRouter.post("/api/nft/list",validationMiddleware(nftSaleSchema),checkSerieinDraftMiddleWare,contextSetterMiddleware, balanceCheckMiddleware(txPallets.marketplace, txActions.list),checkNftOwnershipMiddleware,checkNFTNotCapsuleMiddleware,checkNftNotBurntMiddleware, checkNFTNotListedMiddleware, NftSale);
// nftRouter.post("/api/nft/list-series-autolock",validationMiddleware(nftSaleSchema),checkSerieinDraftMiddleWare,contextSetterMiddleware, balanceCheckMiddleware(txPallets.marketplace, txActions.list),checkNftOwnershipMiddleware,checkNFTNotCapsuleMiddleware,checkNftNotBurntMiddleware, checkNFTNotListedMiddleware, NftSale);
nftRouter.post("/api/nft/unlist", validationMiddleware(unlistNftSchema),checkSerieinDraftMiddleWare,contextSetterMiddleware, balanceCheckMiddleware(txPallets.nfts, txActions.unlist),checkNftOwnershipMiddleware,checkNftListedMiddleware, NftUnlist);

nftRouter.post("/api/nft/decrypt", validationMiddleware(decryptNftSchema),contextSetterMiddleware, checkNftOwnershipMiddleware,checkNftNotBurntMiddleware, decryptNft);
nftRouter.post("/api/nft/transfer", validationMiddleware(nftTransferScehma),contextSetterMiddleware,checkSerieinDraftMiddleWare,balanceCheckMiddleware(txPallets.nfts, txActions.transfer),checkNftOwnershipMiddleware,checkNftNotBurntMiddleware,nftTransfer);
// nftRouter.post("/api/nft/transfer-series-autolock", validationMiddleware(nftTransferScehma),contextSetterMiddleware,checkSerieinDraftMiddleWare,balanceCheckMiddleware(txPallets.nfts, txActions.transfer),checkNftOwnershipMiddleware,checkNftNotBurntMiddleware,nftTransfer);

nftRouter.get("/api/nft/:id",validationMiddleware(getNftDataSchema), getNftDataFromIndexer);
nftRouter.get("/api/nft/owner/:address", validationMiddleware(getNftDataByOwnerScehma),getNFTsByOwner);
nftRouter.get("/api/nft/owned-in-series/:address/:seriesId", validationMiddleware(getNftIdBySeriesForOwnerSchema), getNftIdBySeriesForOwner);
nftRouter.get("/api/nft/series/:seriesId", validationMiddleware(getNftIdBySeriesSchema), getNftIdBySeries);

nftRouter.post("/api/nft/series/lock",validationMiddleware(serieLockSchema), balanceCheckMiddleware(txPallets.nfts, txActions.finishSeries),checkSerieLockedMiddleWare, serieLock);

export default nftRouter;