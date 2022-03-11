import { Router } from 'express'
import { txActions, txPallets } from '../const/tx.const';
import { balanceCheckMiddleware } from '../middleware/balance';
import { validationMiddleware } from "../validation";
import { createMarketPlaceSchema,
    addAccountToAllowListSchema,
    setKindSchema,
    setNameSchema,
    MarketPlaceByIdSchema,
    setCommissionFeeSchema,
    setOwnerFeeSchema,
    setUriSchema,
    setLogoUriSchema,
    
} from "../validation/marketPlace.validation";

import { createMarketPlace ,
    getMarketplaceDataByOwner,
    removeAccountFromAllowList,
    getMarketplaceById,
    setKindForMarketPlace,
    getMarketplaceByIdFromChain,
    addAccountToAllowList,
    setCommissionFee,
    setOwnerForMarketPlace,
    setNameForMarketPlace,
    setUriForMarketPlace,
    setlogoUriForMarketPlace,
    getAllMarketplaceFromChain,
    addAccountToDisAllowList,
    removeAccountFromDisAllowList
} from "../controllers/MarketPlaceController";
import { checkMpOwnershipMiddleware ,marketPlaceTypeMiddleWare,marketPlacePublicTypeMiddleWare,checkMarketPlaceExistence} from '../middleware/marketplace';

const marketplaceRouter = Router();

marketplaceRouter.post("/api/marketplace/create",validationMiddleware(createMarketPlaceSchema),balanceCheckMiddleware(txPallets.marketplace, txActions.create), createMarketPlace);
marketplaceRouter.post("/api/marketplace/update/commission",  validationMiddleware(setCommissionFeeSchema),checkMarketPlaceExistence,balanceCheckMiddleware(txPallets.marketplace, txActions.setCommissionFee),checkMpOwnershipMiddleware, setCommissionFee);
marketplaceRouter.post("/api/marketplace/update/owner",  validationMiddleware(setOwnerFeeSchema),checkMarketPlaceExistence,balanceCheckMiddleware(txPallets.marketplace, txActions.setOwner),checkMpOwnershipMiddleware, setOwnerForMarketPlace);
marketplaceRouter.post("/api/marketplace/update/type",  validationMiddleware(setKindSchema),checkMarketPlaceExistence,balanceCheckMiddleware(txPallets.marketplace, txActions.setKind),checkMpOwnershipMiddleware, setKindForMarketPlace);
marketplaceRouter.post("/api/marketplace/update/name",  validationMiddleware(setNameSchema),checkMarketPlaceExistence,balanceCheckMiddleware(txPallets.marketplace, txActions.setName),checkMpOwnershipMiddleware, setNameForMarketPlace);
marketplaceRouter.post("/api/marketplace/update/uri",  validationMiddleware(setUriSchema),checkMarketPlaceExistence,balanceCheckMiddleware(txPallets.marketplace, txActions.setUri),checkMpOwnershipMiddleware, setUriForMarketPlace);
marketplaceRouter.post("/api/marketplace/update/logo-uri",  validationMiddleware(setLogoUriSchema),checkMarketPlaceExistence,balanceCheckMiddleware(txPallets.marketplace, txActions.setLogoUri),checkMpOwnershipMiddleware, setlogoUriForMarketPlace);
marketplaceRouter.post("/api/marketplace/update/add-account-to-allow-list",  validationMiddleware(addAccountToAllowListSchema),checkMarketPlaceExistence,marketPlaceTypeMiddleWare,balanceCheckMiddleware(txPallets.marketplace, txActions.addAccountToAllowList),checkMpOwnershipMiddleware, addAccountToAllowList);
marketplaceRouter.post("/api/marketplace/update/add-account-to-disallow-list",  validationMiddleware(addAccountToAllowListSchema),checkMarketPlaceExistence,marketPlacePublicTypeMiddleWare,balanceCheckMiddleware(txPallets.marketplace, txActions.addAccountToDisallowList),checkMpOwnershipMiddleware, addAccountToDisAllowList);
marketplaceRouter.post("/api/marketplace/update/remove-account-from-allow-list",  validationMiddleware(addAccountToAllowListSchema),checkMarketPlaceExistence,marketPlaceTypeMiddleWare,balanceCheckMiddleware(txPallets.marketplace, txActions.removeAccountFromAllowList),checkMpOwnershipMiddleware, removeAccountFromAllowList);
marketplaceRouter.post("/api/marketplace/update/remove-account-from-disallow-list",  validationMiddleware(addAccountToAllowListSchema),checkMarketPlaceExistence,marketPlacePublicTypeMiddleWare,balanceCheckMiddleware(txPallets.marketplace, txActions.removeAccountFromDisallowList),checkMpOwnershipMiddleware, removeAccountFromDisAllowList);
marketplaceRouter.get("/api/marketplace/details/:id",  validationMiddleware(MarketPlaceByIdSchema), getMarketplaceByIdFromChain);
marketplaceRouter.get("/api/marketplace/all", getAllMarketplaceFromChain);

export default marketplaceRouter;