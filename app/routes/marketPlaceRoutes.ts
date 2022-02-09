import { Router } from 'express'
import { createMarketPlace ,getMarketplaceDataByOwner,getMarketplaceById, getMarketplaceByIdFromChain,setCommissionFee} from "../controllers/MarketPlaceController";
import { txActions, txPallets } from '../const/tx.const';
import { balanceCheckMiddleware } from '../middleware/balance';
import { validationMiddleware } from "../validation";
import { createMarketPlaceSchema ,MarketPlaceByOwnerSchema,MarketPlaceByIdSchema,setCommissionFeeSchema} from "../validation/marketPlace.validation";

const marketplaceRouter = Router();

marketplaceRouter.post("/api/createMarketPlace",validationMiddleware(createMarketPlaceSchema),balanceCheckMiddleware(txPallets.marketplace, txActions.create), createMarketPlace);
marketplaceRouter.post("/api/setCommissionFee",  validationMiddleware(setCommissionFeeSchema), setCommissionFee);
marketplaceRouter.get("/api/getMarketplacesForOwner/:ownerAddress", validationMiddleware(MarketPlaceByOwnerSchema), getMarketplaceDataByOwner);
marketplaceRouter.get("/api/getMarketplaceById/:id",  validationMiddleware(MarketPlaceByIdSchema), getMarketplaceById);
marketplaceRouter.get("/api/getMarketplaceByIdfromChain/:id",  validationMiddleware(MarketPlaceByIdSchema), getMarketplaceByIdFromChain);

export default marketplaceRouter;