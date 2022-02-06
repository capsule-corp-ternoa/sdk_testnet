import { combine } from 'shamirs-secret-sharing-ts';
export const combineSSSAShares = (shares: string[]) => {
    console.log('share to combine', shares);
    const hexShares = shares.map((bufferShare) => Buffer.from(bufferShare, 'base64').toString('hex'));
    const combinedShares = combine(hexShares);
    return combinedShares.toString('utf8');
  };