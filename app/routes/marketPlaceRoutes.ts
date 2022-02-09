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

const marketplaceRouter = Router();

marketplaceRouter.post("/api/createMarketPlace",validationMiddleware(createMarketPlaceSchema),balanceCheckMiddleware(txPallets.marketplace, txActions.create), createMarketPlace);
marketplaceRouter.post("/api/setCommissionFee",  validationMiddleware(setCommissionFeeSchema), setCommissionFee);
marketplaceRouter.post("/api/setOwnerForMarketPlace",  validationMiddleware(setOwnerFeeSchema), setOwnerForMarketPlace);
marketplaceRouter.post("/api/setKindForMarketPlace",  validationMiddleware(setKindSchema), setKindForMarketPlace);
marketplaceRouter.post("/api/setNameForMarketPlace",  validationMiddleware(setNameSchema), setNameForMarketPlace);
marketplaceRouter.post("/api/setUriForMarketPlace",  validationMiddleware(setUriSchema), setUriForMarketPlace);
marketplaceRouter.post("/api/setlogoUriForMarketPlace",  validationMiddleware(setLogoUriSchema), setlogoUriForMarketPlace);
marketplaceRouter.get("/api/getMarketplacesForOwner/:ownerAddress", validationMiddleware(MarketPlaceByOwnerSchema), getMarketplaceDataByOwner);
marketplaceRouter.get("/api/getMarketplaceById/:id",  validationMiddleware(MarketPlaceByIdSchema), getMarketplaceById);
marketplaceRouter.get("/api/getMarketplaceByIdfromChain/:id",  validationMiddleware(MarketPlaceByIdSchema),balanceCheckMiddleware(txPallets.marketplace, txActions.setCommissionFee), getMarketplaceByIdFromChain);

export default marketplaceRouter;