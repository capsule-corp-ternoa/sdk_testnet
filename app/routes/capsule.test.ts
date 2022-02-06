import request from 'supertest';

import { app, server } from '../../server';
import fs from 'fs';
import { safeDisconnect } from '../service/blockchain.service';

describe('TESTS CAPSULE', () => {

    it('Request /api/setIpfsReference should return a 200 HTTP status!', async () => {
        const result = await request(app)
            .post('/api/setIpfsReference')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                "nftId":"1029",
                "ipfs":"QmbPZsADEjwoW1VkiTxqsoaYSWSQT4M3nK2Ddu2ckqPYd6"
            });
    })
    it('Request /api/removeCapsuleItem should return a 200 HTTP status!', async () => {
        const result = await request(app)
            .post(`/api/removeCapsuleItem`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(
                {
                    "fileIpfs":"Qmb3v5cSQFSYLkQaFeRHym1JyAaAGHcy7h41yLep7FL8pX",
                    "nftId":"1032"
                }
            );
        expect(result.status).toBe(200); 
    })
    it('Request /api/createCapsule should return a 200 HTTP status and Should create Capsule on BlockChain!', async () => {
        const result = await request(app)
            .post(`/api/createCapsule`)

            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(
                {
                    "nft_ipfs": "QmcrNPQw1mWDcvEmt6ycBsbAq5xXFwpG9sUchMX8jHLNDt",
                    "series_id": "4084443294",
                    "capsule_ipfs": " "
                }
            );
            expect(result.status).toBe(200); 
    });
    it('Request /api/CapsuleToNft/ should return a 200 HTTP status!', async () => {
        const result = await request(app)
            .post('/api/CapsuleToNft/1019')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
            });
        expect(result.status).toBe(200); 
    })
    it('Request /api/getCapsuleMetadata should return a 200 HTTP status!', async () => {
        const result = await request(app)
            .post(`/api/getCapsuleMetadata/1032`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
            });
        expect(result.status).toBe(200); 
    })
    it('Request /api/CapsuleItems should return a 200 HTTP status!', async () => {
        const result = await request(app)
            .post(`/api/CapsuleItems/1032`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({});
    })
    it('Request /api/nftToCapsule should return a 200 HTTP status!', async () => {
        const result = await request(app)
            .post('/api/nftToCapsule')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                "nftId":"1033",
                "ipfs":"QmbPZsADEjwoW1VkiTxqsoaYSWSQT4M3nK2Ddu2ckqPYd6"
            });
        expect(result.status).toBe(200); 
    });
});
afterAll((done) => {
    safeDisconnect();
    server.close(()=>{
        console.log('SERVER CLOSED CAPSULE TEST');
        done();
    });
});
