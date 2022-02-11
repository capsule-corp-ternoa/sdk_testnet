import Joi from "joi";
import { join } from "path/posix";

export const mnemonicGenerateSchema: Joi.ObjectSchema = Joi.object({
    query: {
    }
})
export const transferCapsSchema: Joi.ObjectSchema = Joi.object({
    body: {
        recieverAddress:Joi.string().required(),
        value:Joi.number().required()
    }
})