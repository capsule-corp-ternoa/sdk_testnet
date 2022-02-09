import { Router } from 'express'
import { createMarketPlace ,getMarketplaceDataByOwner,getMarketplaceById} from "../controllers/MarketPlaceController";
import { txActions, txPallets } from '../const/tx.const';
import { balanceCheckMiddleware } from '../middleware/balance';
import { validationMiddleware } from "../validation";
import { createMarketPlaceSchema ,MarketPlaceByOwnerSchema,MarketPlaceByIdSchema} from "../validation/marketPlace.validation";

const marketplaceRouter = Router();

marketplaceRouter.post("/api/createMarketPlace",validationMiddleware(createMarketPlaceSchema),balanceCheckMiddleware(txPallets.marketplace, txActions.create), createMarketPlace);
marketplaceRouter.get("/api/getMarketplacesForOwner/:ownerAddress", validationMiddleware(MarketPlaceByOwnerSchema), getMarketplaceDataByOwner);
marketplaceRouter.get("/api/getMarketplaceById/:id",  validationMiddleware(MarketPlaceByIdSchema), getMarketplaceById);
export default marketplaceRouter;