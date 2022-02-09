import { NextFunction, Request, Response } from "express";
import { getSeedFromRequest } from "../helpers";
import { UploadedFile } from 'express-fileupload';
import * as fs from 'fs';
import { getUserFromSeed } from "../service/blockchain.service";
import { isNftOwner, isNftCapsule, checkNftOwnerEqualTo, checkIsNftCapsule } from "../service/nftService";
export const checkNftOwnershipMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let isOwner;
    if (req.body.user && req.body.nft) {
        isOwner = checkNftOwnerEqualTo(req.body.user.address, req.body.nft);
    } else {
        const nftId = getRequestedNftId(req);
        const seed = getSeedFromRequest(req);
        const user = await getUserFromSeed(seed);
        isOwner = await isNftOwner(user.address, nftId);
    }
    if (isOwner) {
        next()
    } else {
        res.status(403).send('Forbidden: You don\'t own this NFT');
    }
}

export const checkNFTCapsuleMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let isCapsule;
    if (req.body.nft){
        isCapsule = checkIsNftCapsule(req.body.nft)
    } else {
        const nftId = getRequestedNftId(req);
        isCapsule = await isNftCapsule(nftId);
    }
    if (isCapsule) {
        next()
    } else {
        res.status(403).send('Forbidden: This NFT is not a capsule!');
    }
}
export const checkNFTNotCapsuleMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let isCapsule;
    if (req.body.nft){
        isCapsule = checkIsNftCapsule(req.body.nft)
    } else {
        const nftId = getRequestedNftId(req);
        isCapsule = await isNftCapsule(nftId);
    }
    if (!isCapsule) {
        next()
    } else {
        res.status(403).send('Forbidden: This NFT is a capsule!');
    }
}
export const checkNftNotBurntMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const isBurnt = req.body.nft.timestampBurn != null;
    if (!isBurnt) {
        next()
    } else {
        res.status(403).send('Forbidden: This NFT is burnt!');
    }
}
export const checkNFTNotListedMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const isNotListed = req.body.nft.listed === 0;
    if (isNotListed) {
        next()
    } else {
        res.status(403).send('Forbidden: This NFT is listed!');
    }
}
export const checkNftListedMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const isListed = req.body.nft.listed === 1;
    if (isListed) {
        next()
    } else {
        res.status(403).send('Forbidden: This NFT is not listed!');
    }
}
export const checkPrivateKeyExistance = async (req: Request, res: Response, next: NextFunction) => {
    const { privateKeyFilePath } = req.body;
    if (fs.existsSync(privateKeyFilePath)) {
        next()
    }
    else {
        res.status(404).send("Private key not found!");
    }
}
export const getRequestedNftId = (req: Request) => req.params.id ? req.params.id : req.params.nftId ? req.params.nftId : req.body.nftId;

export const CheckPreviewFile=async (req: Request, res: Response, next: NextFunction)=>{ 
    const previewFile = req.files?.previewFile as UploadedFile;
    const ImagePreviewFile=req.files?.ImagePreviewFile as UploadedFile;
    if (previewFile.mimetype==="video/mp4")
    {
        if(ImagePreviewFile)
        {
            next()
        }
        else
        {
            res.status(404).send("Image Media is not Provided!")
        }
    }
    else
    {
        next()
    }
}
