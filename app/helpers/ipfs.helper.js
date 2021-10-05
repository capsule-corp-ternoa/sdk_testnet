const fetch = require("node-fetch");
const fs = require('fs');
const FormData = require('form-data');
const { ipfsBaseUrl, ipfsGatewayUri } = require("./ipfs.const");

const defaultBaseurl = `${ipfsBaseUrl}/api/v0`;
class TernoaIpfsApi {
    baseUrl = defaultBaseurl;
    constructor() {
    }
    async addFile(file) {
        let stream = null,
            tempPath = null
        try {
            if (file.mv) {
                tempPath = './uploads/' + file.name;
                await file.mv(tempPath).catch(e => {
                    throw new Error(e)
                });
                stream = fs.createReadStream(tempPath);
            } else {
                stream = file;
            }
            const formData = new FormData();
            formData.append('file', stream);
            const response = await fetch(`${this.baseUrl}/add`, {
                method: 'POST',
                body: formData,
            }).catch(e => {
                throw new Error(e)
            });
            return await response.json().catch(e => {
                throw new Error(e)
            });
        } catch (e) {
            console.error('addFile error', e)
            throw new Error(e);
        } finally {
            if (tempPath) {
                fs.unlinkSync(tempPath);
            }
        }
    }
    async getPinList() {
        try {
            const response = await fetch(`${this.baseUrl}/pin/ls`, {
                method: 'POST',
            }).catch(e => {
                throw new Error(e)
            });
            return await response.json().catch(e => {
                throw new Error(e)
            });
        } catch (e) {
            console.error('getPinList error', e)
            throw new Error(e);
        }
    }
    getIpfsFullLink = (hash)=> `${ipfsGatewayUri}/${hash}`;
}
exports.TernoaIpfsApi = TernoaIpfsApi;