import request from 'supertest';
import { app, server } from '../../server';
import { safeDisconnect } from '../service/blockchain.service';
describe('TESTS USER', () => {
    it('Request /api/mnemonicGenerate should return a valid mnemonic!', async () => {
        const result = await request(app).get('/api/mnemonicGenerate').send();
        expect(result.status).toBe(200);
        expect(result.body.mnemonic).toBeDefined();
        expect(result.body.address).toBeDefined();
    });
});
afterAll((done) => {
    safeDisconnect();
    server.close(() => {
        console.log('SERVER CLOSED USER TEST');
        done();
    });
});

