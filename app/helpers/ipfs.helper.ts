import fetch from "node-fetch";
import * as fs from 'fs';
import FormData  from 'form-data';

import { ipfsBaseUrl, ipfsGatewayUri } from "./ipfs.const";

// const defaultBaseurl = `${ipfsBaseUrl()}/api/v0`;
class TernoaIpfsApi {
    constructor() {
    }
    
    async addFile(file:any) {
        const baseUrl = `${ipfsBaseUrl()}/api/v0`;
        let stream = null,
            tempPath = null
        try {
            if (file.mv) {
                tempPath = './uploads/' + file.name;
                await file.mv(tempPath).catch((e:any) => {
                    throw new Error(e)
                });
                stream = fs.createReadStream(tempPath);
            } else {
                stream = file;
            }
            const formData = new FormData();
            formData.append('file', stream);
            //console.log('IPFS base URL', baseUrl);
            const response = await fetch(`${baseUrl}/add`, {
                method: 'POST',
                body: formData,
            }).catch(e => {
                throw new Error(e)
            });
            return await response.json().catch(e => {
                throw new Error(e)
            });
        } catch (e:any) {
            //console.error('addFile error', e)
            throw new Error(e);
        } finally {
            if (tempPath) {
                fs.unlinkSync(tempPath);
            }
        }
    }
    async getPinList() {
        try {
            const baseUrl = `${ipfsBaseUrl()}/api/v0`;
            const response = await fetch(`${baseUrl}/pin/ls`, {
                method: 'POST',
            }).catch(e => {
                throw new Error(e)
            });
            return await response.json().catch(e => {
                throw new Error(e)
            });
        } catch (e:any) {
            //console.error('getPinList error', e)
            throw new Error(e);
        }
    }
    
    getIpfsFullLink = (hash:any)=> `${ipfsGatewayUri()}/${hash}`;
}
export default TernoaIpfsApi ;