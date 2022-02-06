import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true // remove unknown props
}
export const validationMiddleware = (validationSchema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
    const { error } = validationSchema.validate(req, options);
    if (error) {
        res.status(400).send({ message: 'Bad request', details: error.details })
    } else {
        next()
    }
};
