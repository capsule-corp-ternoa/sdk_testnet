import { NextFunction, Request, Response } from "express";
import { txActions, txPallets } from "../const/tx.const";
import { getSeedFromRequest } from "../helpers";
import { BalanceCheck } from "../service/blockchain.service";

export const balanceCheckMiddleware = (txPallet: txPallets, txAction: txActions) => async (req: Request, res: Response, next: NextFunction) => {
    let seedOrAddress = req.body.user ? req.body.user.address : getSeedFromRequest(req);
    const balanceAvailable = await BalanceCheck(seedOrAddress, txPallet, txAction);
    if (balanceAvailable === true) {
        next();
    } else {
        res.status(403).send("Low Balance for this Transaction!")
    }
}