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
        id:Joi.string().required(),
    }
})


export const setCommissionFeeSchema: Joi.ObjectSchema = Joi.object({
    body:{
        mpId:Joi.string().required(),
        commission_fee:Joi.string().required(),
        seed:Joi.string().optional()
    }
})