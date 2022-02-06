const { split : generateSSSAShares} = require('shamirs-secret-sharing');
const SSSA_NUMSHARES = process.env.SSSA_NUMSHARES || 8;
export const SSSA_THRESHOLD = process.env.SSSA_THRESHOLD || 4;

export const sssaGenerate = (content:any)=>  { 
    const bufferShares = generateSSSAShares(content, { shares :SSSA_NUMSHARES, threshold:SSSA_THRESHOLD });
    
    return bufferShares.map((bufferShare:any)=>bufferShare.toString('base64'));
};

