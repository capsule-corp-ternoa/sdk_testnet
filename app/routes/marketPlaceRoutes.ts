import { Router } from 'express'
import { createMarketPlace } from "../controllers/MarketPlaceController";
import { txActions, txPallets } from '../const/tx.const';
import { balanceCheckMiddleware } from '../middleware/balance';
import { validationMiddleware } from "../validation";
import { createMarketPlaceSchema } from "../validation/marketPlace.validation";

const marketplaceRouter = Router();
marketplaceRouter.post("/api/createMarketPlace",validationMiddleware(createMarketPlaceSchema),balanceCheckMiddleware(txPallets.marketplace, txActions.create), createMarketPlace);
export default marketplaceRouter;