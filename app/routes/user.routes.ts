
import {
  mnemonicGenerate,
  TransferCapsandKeepAlive
} from "../controllers/userController"
import { Router } from 'express'
import { validationMiddleware } from "../validation";
import { mnemonicGenerateSchema,transferCapsSchema } from "../validation/user.validation";
import { balanceCheckMiddleware } from "../middleware/balance";
import { txPallets, txActions } from "../const/tx.const";

const userRouter = Router();

userRouter.get("/api/user/generate-mnemonic",validationMiddleware(mnemonicGenerateSchema), mnemonicGenerate);
userRouter.post("/api/user/balances/transfer-keep-alive",validationMiddleware(transferCapsSchema),balanceCheckMiddleware(txPallets.balances,txActions.transferKeepAlive), TransferCapsandKeepAlive);

export default userRouter;