import Joi from "joi";

export const saveSSSAToSGXSchema: Joi.ObjectSchema = Joi.object({
    body:{
        nftId:Joi.string().required(),
        privateKeyFilePath:Joi.string().required(), 
        seed:Joi.string().optional(),
    }
})