import Joi from "joi";


export const capsuleItemEncryptSchema: Joi.ObjectSchema = Joi.object({
    files:{
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
        
        title:Joi.string().required(),
        ipfs:Joi.string().required(),
        mediaType:Joi.string().required(),
        size:Joi.string().required()
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
    params:{
        nftId:Joi.string().required()
    },
    body:{
        seed:Joi.string().optional()
    }
})

export const capsuleCommonSchema: Joi.ObjectSchema = Joi.object({
    params:{
        nftId:Joi.string().required()
    }
})
export const addFileToCapsuleschema: Joi.ObjectSchema = Joi.object({
    files:{
        capsuleFile:Joi.object().required()
    },
    body:{
        title:Joi.string().required()
    },
    params:{
        nftId:Joi.string().required()
    }
})
export const removeFileFromCapsuleSchema: Joi.ObjectSchema = Joi.object({
    params:{
        nftId:Joi.string().required()
    },
    body:{
        seed:Joi.string().optional(),
        fileIpfs:Joi.string().required()
    }
})