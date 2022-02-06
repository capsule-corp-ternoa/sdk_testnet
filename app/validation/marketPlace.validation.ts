import Joi from "joi";

export const createMarketPlaceSchema: Joi.ObjectSchema = Joi.object({
    body:{
        name:Joi.string().required(),
        commission_fee:Joi.string().required(), 
        kind:Joi.string().required(), 
        uri:Joi.string().required(),
        logoUri:Joi.string().required(),
        seed:Joi.string().optional(),
    }
})