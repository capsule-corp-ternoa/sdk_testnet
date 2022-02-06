import request from 'supertest';
import { generatePgp } from '../../common';
import { app, server } from '../../server';
import fs from 'fs';
import { safeDisconnect } from '../service/blockchain.service';

describe('TESTS SGX', () => {
    it('Request /api/saveShamirForNFT should return a 200 HTTP status!', async () => {
        const pgp = await generatePgp();
        const result = await request(app)
            .post('/api/saveShamirForNFT')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                "nftId":"633",
                "privateKeyFilePath":"./nftKeys/QmTUGtTDw3Td6z4Ssde2QKTYwWAJ92frNpxgAfLFmyxxPu"
            });
        expect(result.status).toBe(200);
        
    });
});
afterAll((done) => {
    safeDisconnect();
    server.close(()=>{
        console.log('SERVER CLOSED SGX TEST');
        done();
    });
});