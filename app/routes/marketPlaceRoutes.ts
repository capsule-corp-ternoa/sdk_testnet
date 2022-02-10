import { Router } from 'express'
import { txActions, txPallets } from '../const/tx.const';
import { balanceCheckMiddleware } from '../middleware/balance';
import { validationMiddleware } from "../validation";
import { createMarketPlaceSchema,
    MarketPlaceByOwnerSchema,
    setKindSchema,
    setNameSchema,
    MarketPlaceByIdSchema,
    setCommissionFeeSchema,
    setOwnerFeeSchema,
    setUriSchema,
    setLogoUriSchema
} from "../validation/marketPlace.validation";

import { createMarketPlace ,
    getMarketplaceDataByOwner,
    getMarketplaceById,
    setKindForMarketPlace,
    getMarketplaceByIdFromChain,
    setCommissionFee,
    setOwnerForMarketPlace,
    setNameForMarketPlace,
    setUriForMarketPlace,
    setlogoUriForMarketPlace,
    getAllMarketplaceFromChain
    
} from "../controllers/MarketPlaceController";
import { checkMpOwnershipMiddleware } from '../middleware/marketplace';

const marketplaceRouter = Router();

marketplaceRouter.post("/api/createMarketPlace",validationMiddleware(createMarketPlaceSchema),balanceCheckMiddleware(txPallets.marketplace, txActions.create), createMarketPlace);
marketplaceRouter.post("/api/setCommissionFee",  validationMiddleware(setCommissionFeeSchema),balanceCheckMiddleware(txPallets.marketplace, txActions.setCommissionFee),checkMpOwnershipMiddleware, setCommissionFee);
marketplaceRouter.post("/api/setOwnerForMarketPlace",  validationMiddleware(setOwnerFeeSchema),balanceCheckMiddleware(txPallets.marketplace, txActions.setOwner),checkMpOwnershipMiddleware, setOwnerForMarketPlace);
marketplaceRouter.post("/api/setKindForMarketPlace",  validationMiddleware(setKindSchema),balanceCheckMiddleware(txPallets.marketplace, txActions.setKind),checkMpOwnershipMiddleware, setKindForMarketPlace);
marketplaceRouter.post("/api/setNameForMarketPlace",  validationMiddleware(setNameSchema),balanceCheckMiddleware(txPallets.marketplace, txActions.setName),checkMpOwnershipMiddleware, setNameForMarketPlace);
marketplaceRouter.post("/api/setUriForMarketPlace",  validationMiddleware(setUriSchema),balanceCheckMiddleware(txPallets.marketplace, txActions.setUri),checkMpOwnershipMiddleware, setUriForMarketPlace);
marketplaceRouter.post("/api/setlogoUriForMarketPlace",  validationMiddleware(setLogoUriSchema),balanceCheckMiddleware(txPallets.marketplace, txActions.setLogoUri),checkMpOwnershipMiddleware, setlogoUriForMarketPlace);
marketplaceRouter.get("/api/getMarketplacesForOwner/:ownerAddress", validationMiddleware(MarketPlaceByOwnerSchema), getMarketplaceDataByOwner);
marketplaceRouter.get("/api/getMarketplaceById/:id",  validationMiddleware(MarketPlaceByIdSchema), getMarketplaceById);
marketplaceRouter.get("/api/getMarketplaceByIdfromChain/:id",  validationMiddleware(MarketPlaceByIdSchema), getMarketplaceByIdFromChain);
marketplaceRouter.get("/api/getAllMarketplaces", getAllMarketplaceFromChain);

export default marketplaceRouter;