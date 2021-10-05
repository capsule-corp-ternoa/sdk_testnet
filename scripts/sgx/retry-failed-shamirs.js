const fs = require('fs');
const {
    v4: uuid
} = require('uuid');
const axios = require('axios');
const {
    httpGet
} = require('../common');
const {
    cryptData
} = require('../common/nft-encrypt');
const shamirPath = process.env.SHAMIR_PATH;
const requestPromises = []
let serverPGPKeys = {}
let success = 0,
    failed = 0;
const onShamirSaved = (shamirFilePath, resolve) => {
    success++;
    fs.unlinkSync(shamirFilePath);
    resolve()
};
const onShamirFailed = (resolve) => {
    failed++;
    resolve()
};
const processFailedShamirs = async () => {
    console.log('shamirPath:' + shamirPath);
    if (!shamirPath) {
        console.error('No shamir path given')
        process.exit()
    }
    const subFolders = fs.readdirSync(shamirPath).filter(sub => fs.statSync(`${shamirPath}/${sub}`).isDirectory());
    for (const subFolder of subFolders) {
        const subFolderPath = `${shamirPath}/${subFolder}`
        const encodeddSgxNodeApiUrl = subFolder;
        const shamirFiles = fs.readdirSync(subFolderPath).filter(file => fs.statSync(`${subFolderPath}/${file}`).isFile());
        for (const shamirFile of shamirFiles) {
            const shamirFilePath = `${subFolderPath}/${shamirFile}`
            const sgxData = fs.readFileSync(shamirFilePath).toString('utf-8');
            const sgxNodeApiUrl = Buffer.from(encodeddSgxNodeApiUrl, 'base64').toString('utf8');
            const _baseUrl = `${sgxNodeApiUrl}/api`;
            let serverPGPKey = null;
            if (serverPGPKeys[_baseUrl]) {
                serverPGPKey = serverPGPKeys[_baseUrl]
            } else {
                const serverPGPKeyRes = await httpGet(`${_baseUrl}/keys/getpublickey`).catch(e => console.error(e))
                if (serverPGPKeyRes) {
                    serverPGPKey = serverPGPKeyRes;
                    serverPGPKeys[_baseUrl] = serverPGPKeyRes
                }
            }
            await new Promise(async (resolve) => {
                if (!serverPGPKey) {
                    return onShamirFailed(resolve)
                }
                const encryptedSGXData = await cryptData(sgxData, serverPGPKey)
                axios.post(`${_baseUrl}/nft/saveShamir`, {
                    sgxData: encryptedSGXData
                }).then(() => onShamirSaved(shamirFilePath,resolve)).catch(() => onShamirFailed(resolve));
            });
            console.log('shamir processed');
        }
    };
}
const scriptLabel = `retry-failed-shamirs_${uuid()}`;
console.time(scriptLabel)
processFailedShamirs().then(()=>{
    console.info(`Process finished - processed=${requestPromises.length} - success=${success} - failed=${failed}`)
    console.timeEnd(scriptLabel)
})
