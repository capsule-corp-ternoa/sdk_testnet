import Joi from "joi";


export const capsuleItemEncryptSchema: Joi.ObjectSchema = Joi.object({
    files:{
        nftId:Joi.string().required(),
        file:Joi.object().required()
    },
})

export const setIpfsReferenceSchema: Joi.ObjectSchema = Joi.object({
    body:{
        nftId:Joi.string().required(),
        seed:Joi.string().optional(),
        ipfs:Joi.string().required()
    }
})
export const nftToCapsuleSchema: Joi.ObjectSchema = Joi.object({

    body:{
        nftId:Joi.string().required(),
        seed:Joi.string().optional(),
        ipfs:Joi.string().required()
    }
})
export const uploadCapsuleJsonSchema: Joi.ObjectSchema = Joi.object({
    body:{
        capsuleCryptedMedias:Joi.array().required(),
    }
})

export const capsuleCreateSchema: Joi.ObjectSchema = Joi.object({
    body: {
        seed: Joi.string().optional(),
        nft_ipfs: Joi.string().required(),
        capsule_ipfs: Joi.string().required(),
        series_id: Joi.string().optional()
    }
})

export const capsuleRemoveSchema: Joi.ObjectSchema = Joi.object({
    body:{
        nftId:Joi.string().required(),
        seed:Joi.string().optional()
    }
})

export const capsuleCommonSchema: Joi.ObjectSchema = Joi.object({
    body:{
        nftId:Joi.string().required()
    }
})

export const getCapsuleItemsSchema: Joi.ObjectSchema = Joi.object({
    params:{
        nftId:Joi.string().required()
    }
})

export const addFileToCapsuleschema: Joi.ObjectSchema = Joi.object({
    files:{
        capsuleFile:Joi.object().required()
    },
    body:{
        title:Joi.string().required(),
        nftId:Joi.string().required()
    }
})
export const removeFileFromCapsuleSchema: Joi.ObjectSchema = Joi.object({
    body:{
        nftId:Joi.string().required(),
        seed:Joi.string().optional(),
        fileIpfs:Joi.string().required()
    }
})