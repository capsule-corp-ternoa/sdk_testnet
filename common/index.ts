import * as openpgp from 'openpgp';
import fetch from 'node-fetch';
import fs from 'fs';
import * as crypto from 'crypto';
import { createReadStream } from 'fs';


const localTempFolder = process.env.LOCAL_TEMP_FOLDER || './tmp/';
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000/api";

export const post = (endpoint: string, body: any, options = null) => new Promise(async (success, reject) => {

    const result = await fetch(`${baseUrl}${endpoint}`, {
        method: 'post',
        body,
        ...options as any,
    });
    const bodyReponse = await result.text();
    if (result.status == 200) {
        try {
            const json = JSON.parse(bodyReponse)
            success(json);
        } catch (e) {
            success(bodyReponse);
        }
    } else {
        //console.error('fetch error on endpoint', endpoint, result.status, bodyReponse, body);
        reject(body);
    }
});

export const httpGet = (url: string, options = null) => new Promise(async (success, reject) => {

    const result = await fetch(url, {
        method: 'get',
        ...options as any,

    }).catch((e: any) => {
        reject(e);
        throw new Error('Http httpGet failed:' + e.toString());
    });
    const bodyReponse = await result.text();
    if (result.status == 200) {
        try {
            const json = JSON.parse(bodyReponse)
            success(json);
        } catch (e) {
            success(bodyReponse);
        }
    } else {
        //console.error('fetch error on url', url, result.status, bodyReponse);
        reject(url);
    }
});

export const httpPost = (url: string, body: any, options = null) => new Promise(async (success, reject) => {
    const result = await fetch(url, {
        method: 'post',
        body,
        ...options as any,

    }).catch((e) => {
        reject(e);
        throw new Error('Http Post failed:' + e.toString());
    });
    const bodyReponse = await result.text();
    if (result.status == 200) {
        try {
            const json = JSON.parse(bodyReponse)
            success(json);
        } catch (e) {
            success(bodyReponse);
        }
    } else {
        console.error('fetch error on url', url, result.status, bodyReponse, body);
        reject(url);
    }
});

export const streamToBuffer = (stream: any) => {
    return new Promise((resolve, reject) => {
        const data: any = [];

        stream.on('data', (chunk: string) => {

            data.push(chunk);
        });

        stream.on('end', () => {
            resolve(Buffer.concat(data))
        })

        stream.on('error', (err: any) => {
            reject(err)
        })

    })
};




export const getHashFromLink = (link: string) => {
    const splits = link.split('/');
    return splits[splits.length - 1];
};

export const contentToStream = (fileContent: any, path: any) => {
    fs.writeFileSync(path, fileContent);
    return fs.createReadStream(path);
};

export const getStreamFilename = (stream: any) => {
    const path = stream.path;
    const pathChunks = path.split('/');
    return pathChunks[pathChunks.length - 1];
};

export const deleteFile = (path: any) => fs.unlink(path, () => { return });

export const readFile = (filePath: any) => {
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath)
    } else {
        throw new Error(`File not found at ${filePath}`)
    }
}

export const getFile = (filePath: any) => {
    if (fs.existsSync(filePath)) {
        return fs.createReadStream(filePath);
    } else {
        throw new Error(`File not found at ${filePath}`);
    }
};

export const getFilePath = (fileName: any) => `${localTempFolder}${fileName}`;

export const getFileStreamFromName = (fileName: any) => getFile(getFilePath(fileName));

export const getFileHash = (stream: any) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const input = createReadStream(stream.path);
        input.on('error', () => {
            reject();
        });

        input.on('data', (chunk) => {
            hash.update(chunk);
        });

        input.on('close', () => {
            const fileHash = hash.digest('hex');
            resolve(fileHash);
        });
    });
}

export const identifyPgpKeyFromBatch = (batchArray: any, nftData: any) => {
    const nftIpfs = nftData.nftIpfs
    const batchItem = batchArray.find((nft: any) => nft.nftIPFSHash === nftIpfs);
    return batchItem.pgp;
}
export const generatePgp = () => openpgp.generateKey({
    type: 'rsa',
    rsaBits: 2048,
    userIDs: [{
        name: 'john doe',
        email: 'johndoe@ternoa.com',
    }]
});
export const cryptFilePgp = async (file: any, publicPGP: string) => {
    const buffer = await streamToBuffer(file) as any;
    const content = buffer.toString("base64");
    const message = await openpgp.createMessage({
        text: content
    });
    const publicKey = await openpgp.readKey({
        armoredKey: publicPGP
    })
    const encrypted = await openpgp.encrypt({
        message,
        encryptionKeys: [publicKey],
    });
    return encrypted
}

