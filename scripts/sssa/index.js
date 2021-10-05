const { split : generateSSSAShares} = require('shamirs-secret-sharing')
const SSSA_NUMSHARES = process.env.SSSA_NUMSHARES || 8;
const SSSA_THRESHOLD = process.env.SSSA_THRESHOLD || 4;
exports.sssaGenerate = (content)=>  { 
    const bufferShares = generateSSSAShares(content, { shares :SSSA_NUMSHARES, threshold:SSSA_THRESHOLD });
    return bufferShares.map(bufferShare=>bufferShare.toString('base64'));
};
exports.SSSA_THRESHOLD = SSSA_THRESHOLD;
