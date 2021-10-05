const fetch = require('node-fetch');
const fs = require('fs');
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000/api";
exports.post = (endpoint, body, options = null) => new Promise(async (success, reject) => {
    const result = await fetch(`${baseUrl}${endpoint}`, {
        method: 'post',
        body,
        ...options,
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
        console.error('fetch error on endpoint', endpoint, result.status, bodyReponse, body);
        reject(body);
    }
});

exports.httpGet = (url, options = null) => new Promise(async (success, reject) => {
    const result = await fetch(url, {
        method: 'get',
        ...options,
    }).catch((e) => {
        reject(e);
        throw new Error('Http httpGet failed:'+e.toString());
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
        console.error('fetch error on url', url, result.status, bodyReponse);
        reject(url);
    }
});
exports.httpPost = (url, body, options = null) => new Promise(async (success, reject) => {
    const result = await fetch(url, {
        method: 'post',
        body,
        ...options,
    }).catch((e) => {
        reject(e);
        throw new Error('Http Post failed:'+e.toString());
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
exports.streamToBuffer = (stream) => {
    return new Promise((resolve, reject) => {
        const data = [];

        stream.on('data', (chunk) => {
            data.push(chunk);
        });

        stream.on('end', () => {
            resolve(Buffer.concat(data))
        })

        stream.on('error', (err) => {
            reject(err)
        })

    })
};

exports.contentToStream = (fileContent, path) => {
    fs.writeFileSync(path, fileContent);
    return fs.createReadStream(path);
};
exports.getStreamFilename = (stream) => {
    const path = stream.path;
    const pathChunks = path.split('/');
    return pathChunks[pathChunks.length - 1];
};
exports.getStreamFilename = (stream) => {
    const path = stream.path;
    const pathChunks = path.split('/');
    return pathChunks[pathChunks.length - 1];
};
exports.deleteFile = (path) => fs.unlink(path);