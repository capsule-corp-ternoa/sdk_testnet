import { Request } from 'express';
export const getSeedFromRequest = (req: Request) => {
    const seed = req.body.seed  ? req.body.seed : process.env.SEED;
    return seed;
}