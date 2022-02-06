import request from 'supertest';
import { generatePgp } from '../../common';
import { app, server } from '../../server';
import fs from 'fs';
import { safeDisconnect } from '../service/blockchain.service';

describe('TESTS NFT', () => {
    const privatePgpPath = `./${new Date().getTime()}_private.key`;
    const nftOwner='5HWe2ujHcPnD5ApKERksoGXzdJPAAin8zafvKzwmnRv4RwAa'
    const nftIpfsTest = 'https://ipfs.ternoa.dev/ipfs/QmbLLZFeptbNbejxZiXXzes8C4b2k6em3GEHG9cXLMCaHe'
    const seriesId = `the_testing_series_${new Date().getTime()}`;
    let createdNftId: string | null = null;
    it('Request /api/mintNFT should return a 200 HTTP status!', async () => {
        const pgp = await generatePgp();
        fs.writeFileSync(privatePgpPath, pgp.privateKey);
        const result = await request(app)
            .post('/api/mintNFT')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                privateKeyFilePath: privatePgpPath,
                nft_ipfs: nftIpfsTest,
                seriesId
            });
        //console.info('result MINT', result.body, typeof result.body)
        expect(result.status).toBe(200);
        expect(result.body.nftId).toBeDefined();
        createdNftId = result.body.nftId;
        fs.unlinkSync(privatePgpPath);
    });
    it('Request /api/serie/lock should return a 200 HTTP status!', async () => {
        const result = await request(app)
            .post('/api/serie/lock')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                seriesId
            });
        //console.info('result LOCK', result.text)
        expect(result.status).toBe(200);
    });
    it('Request /api/NftSale should return a 200 HTTP status!', async () => {
        const result = await request(app)
            .post('/api/NftSale')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                nftId: createdNftId,
                price: 500,
                mpId: 1
            });
         //console.info('result LIST', result.text)
        expect(result.status).toBe(200);
    });
    it('Request /api/nft/unlist should return a 200 HTTP status!', async () => {
        const result = await request(app)
            .post(`/api/nft/unlist/${createdNftId}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
            });
        console.info('result UNLIST', result.text)
        expect(result.status).toBe(200);
    });
    it('Request /api/burnNft should return a 200 HTTP status!', async () => {
        const result = await request(app)
            .post(`/api/burnNft/${createdNftId}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
            });
        expect(result.status).toBe(200); 
    });

    it('Request /api/burnNftBatch should return a 200 HTTP status!', async () => {
        const result = await request(app)
            .post(`/api/burnNftBatch`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                nftIds:["71"]
            })
        })

    it('Request /api/nft should return a 200 HTTP status!', async () => {
        const result = await request(app)
            .get(`/api/nft/${createdNftId}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({});
        expect(result.status).toBe(200); 
    });
     it('Request /api/uploadNFTJson should return a 200 HTTP status!', async () => {
        const result = await request(app)
            .post('/api/uploadNFTJson')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                title:"testing title",
                description:"testing description",
                mediaType: "image/jpeg",
                mediaIPFSHash: "Qme849SY864BBoxvkmT5APnVikCBu2qBHrgn3Y8gjAr1Rt",
                mediaSize: "145758",
                encryptedMediaIPFSHash: "QmVE7ERPHyrX1PYj2vWZh2xbeom2E662cNd4SBrYaNLQMa",
                encryptedMediaType: "image/jpeg",
                encryptedMediaSize: "1259891",
                publicPgpIPFSHash: "QmYutrjJ3LyWtL8iLiFrDPtdmEqYkd2UwpqS61V6Au4i67",
                privateKeyFilePath: "./nftKeys/QmYutrjJ3LyWtL8iLiFrDPtdmEqYkd2UwpqS61V6Au4i67"
            });
        //console.info('result LOCK', result.text)
        expect(result.status).toBe(200);
        });
    it('Request /api/getNftIdBySeries should return a 200 HTTP status!', async () => {
        const result = await request(app)
            .get(`/api/getNftIdBySeries`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                "seriesId":seriesId
            })
    })
     it('Request /api/getNFTsByOwner should return a 200 HTTP status!', async () => {
        const result = await request(app)
            .post(`/api/getNFTsByOwner/${nftOwner}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
            });
        expect(result.status).toBe(200); 
    });
});
afterAll((done) => {
    safeDisconnect();
    server.close(()=>{
        console.log('SERVER CLOSED NFT TEST');
        done();
    });
});


