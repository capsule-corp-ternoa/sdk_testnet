import Joi from "joi";

export const createMarketPlaceSchema: Joi.ObjectSchema = Joi.object({
    body:{
        name:Joi.string().required(),
        commission_fee:Joi.string().required(), 
        kind:Joi.string().required(), 
        uri:Joi.string().optional(),
        logoUri:Joi.string().optional(),
        seed:Joi.string().optional(),
    }
})

export const MarketPlaceByOwnerSchema: Joi.ObjectSchema = Joi.object({
    params:{
        ownerAddress:Joi.string().required(),
    }
})

export const MarketPlaceByIdSchema: Joi.ObjectSchema = Joi.object({
    params:{
        id:Joi.number().min(1).required(),
    }
})


export const setCommissionFeeSchema: Joi.ObjectSchema = Joi.object({
    body:{
        mpId:Joi.string().required(),
        commission_fee:Joi.string().required(),
        seed:Joi.string().optional()
    }
})

export const setOwnerFeeSchema: Joi.ObjectSchema = Joi.object({
    body:{
        mpId:Joi.string().required(),
        owner:Joi.string().required(),
        seed:Joi.string().optional()
    }
})
export const setKindSchema: Joi.ObjectSchema = Joi.object({
    body:{
        mpId:Joi.string().required(),
        kind:Joi.string().required(),
        seed:Joi.string().optional()
    }
})
export const setNameSchema: Joi.ObjectSchema = Joi.object({
    body:{
        mpId:Joi.string().required(),
        name:Joi.string().required(),
        seed:Joi.string().optional()
    }
})

export const setUriSchema: Joi.ObjectSchema = Joi.object({
    body:{
        mpId:Joi.string().required(),
        uri:Joi.string().required(),
        seed:Joi.string().optional()
    }
})
export const setLogoUriSchema: Joi.ObjectSchema = Joi.object({
    body:{
        mpId:Joi.string().required(),
        logoUri:Joi.string().required(),
        seed:Joi.string().optional()
    }
})

export const addAccountToAllowListSchema: Joi.ObjectSchema = Joi.object({
    body:{
        mpId:Joi.string().required(),
        address:Joi.string().required(),
        seed:Joi.string().optional()
    }
})