import Joi from "joi";


export const nftBurnSchema: Joi.ObjectSchema = Joi.object({
    params:{
        nftId:Joi.string().required()
    },
    body:{
        seed:Joi.string()
    }
    
})
export const nftMintSchema: Joi.ObjectSchema = Joi.object({
    body:{
        seed:Joi.string().optional(),
        nft_ipfs:Joi.string().required(),
        privateKeyFilePath:Joi.string().required(),
        seriesId:Joi.string().optional()
    }
    
})
export const unlistNftSchema: Joi.ObjectSchema = Joi.object({
    params: {
        id: Joi.number().required(),
    },
    body: {
        seed: Joi.string().optional(),
    }

})
export const uploadNFTJsonSchema: Joi.ObjectSchema=Joi.object({
    body:{
        title:Joi.string().required(),
        description:Joi.string().required(),
        mediaType: Joi.string().required(),
        mediaIPFSHash: Joi.string().required(),
        mediaSize: Joi.string().required(),
        encryptedMediaIPFSHash: Joi.string().required(),
        encryptedMediaType: Joi.string().required(),
        encryptedMediaSize: Joi.string().required(),
        publicPgpIPFSHash: Joi.string().required(),
        imagePreviewIPFSHash:Joi.string().optional(),
        privateKeyFilePath:Joi.string().optional()
    }
})


export const getNftDataSchema: Joi.ObjectSchema=Joi.object({
    params: {
        id: Joi.number().required(),
    }
})
export const createNewNftSchema:Joi.ObjectSchema = Joi.object({
    body:{
        seed: Joi.string().optional(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        seriesId: Joi.string().optional(),
    },
    files:{
        previewFile:Joi.object().required(),
        encryptFile:Joi.object().required(),
        ImagePreviewFile:Joi.object().optional()
    }
})

export const nftBatchShema:Joi.ObjectSchema=Joi.object({
    body:{
        nftIds: Joi.array().required().items(Joi.string().required()),
        seed: Joi.string().optional(),
    }
})
export const encryptAndUploadMediaSchema:Joi.ObjectSchema= Joi.object({
    files:{
        file:Joi.object().required()
    }
});

export const decryptNftSchema : Joi.ObjectSchema = Joi.object({
    params: {
        id: Joi.number().required(),
    },
    body: {
        seed: Joi.string().optional(),
    }
});

export const getNftIdBySeriesSchema:Joi.ObjectSchema = Joi.object({
    body:{
        seriesId:Joi.string().required(),
        seed: Joi.string().optional()
    }
});
export const serieLockSchema: Joi.ObjectSchema = Joi.object({
    body:{
        seed:Joi.string().optional(),
        seriesId:Joi.string().required()
    }
});
export const nftSaleSchema: Joi.ObjectSchema = Joi.object({
    body: {
        seed: Joi.string().optional(),
        nftId:Joi.number().required(),
        price:Joi.number().required(),
        mpId:Joi.number().required(),
    }
});
export const getNftDataByOwnerScehma:Joi.ObjectSchema=Joi.object({
    params: {
        ownerAddress: Joi.string().required(),
    }
})
