import Joi from "joi";

export const uploadImSchema:Joi.ObjectSchema = Joi.object({
    files:{
        file:Joi.object().required(),
    }
})