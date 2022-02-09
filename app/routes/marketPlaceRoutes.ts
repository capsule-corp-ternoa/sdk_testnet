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
    setlogoUriForMarketPlace
    
} from "../controllers/MarketPlaceController";
import { checkMpOwnershipMiddleware } from '../middleware/marketplace';

const marketplaceRouter = Router();

marketplaceRouter.post("/api/createMarketPlace",validationMiddleware(createMarketPlaceSchema),balanceCheckMiddleware(txPallets.marketplace, txActions.create), createMarketPlace);
marketplaceRouter.post("/api/setCommissionFee",  validationMiddleware(setCommissionFeeSchema),checkMpOwnershipMiddleware,balanceCheckMiddleware(txPallets.marketplace, txActions.setCommissionFee), setCommissionFee);
marketplaceRouter.post("/api/setOwnerForMarketPlace",  validationMiddleware(setOwnerFeeSchema),checkMpOwnershipMiddleware,balanceCheckMiddleware(txPallets.marketplace, txActions.setOwner), setOwnerForMarketPlace);
marketplaceRouter.post("/api/setKindForMarketPlace",  validationMiddleware(setKindSchema),checkMpOwnershipMiddleware,balanceCheckMiddleware(txPallets.marketplace, txActions.setKind), setKindForMarketPlace);
marketplaceRouter.post("/api/setNameForMarketPlace",  validationMiddleware(setNameSchema),checkMpOwnershipMiddleware,balanceCheckMiddleware(txPallets.marketplace, txActions.setName), setNameForMarketPlace);
marketplaceRouter.post("/api/setUriForMarketPlace",  validationMiddleware(setUriSchema),checkMpOwnershipMiddleware,balanceCheckMiddleware(txPallets.marketplace, txActions.setUri), setUriForMarketPlace);
marketplaceRouter.post("/api/setlogoUriForMarketPlace",  validationMiddleware(setLogoUriSchema),checkMpOwnershipMiddleware,balanceCheckMiddleware(txPallets.marketplace, txActions.setLogoUri), setlogoUriForMarketPlace);
marketplaceRouter.get("/api/getMarketplacesForOwner/:ownerAddress", validationMiddleware(MarketPlaceByOwnerSchema), getMarketplaceDataByOwner);
marketplaceRouter.get("/api/getMarketplaceById/:id",  validationMiddleware(MarketPlaceByIdSchema), getMarketplaceById);
marketplaceRouter.get("/api/getMarketplaceByIdfromChain/:id",  validationMiddleware(MarketPlaceByIdSchema), getMarketplaceByIdFromChain);

export default marketplaceRouter;