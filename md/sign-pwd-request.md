### [Generate encrypted NFT zip](./create-nft.md)
Send server PGP-encrypted NFT AES zipped key with user signature 

:warning: Series: Run this request as many times as items created in the serie.

:arrow_right:	For a 10 NFT serie, run this signPasswordRequest request 10 times using each nftId generated before and its associated keyPath returned in the cryptFile request step. 


**Call**
```
curl --request POST \
  --url https://sdkdev.ternoa.dev/api/signPasswordRequest \
  --header 'Content-Type: application/json' \
  --data '{
    "nftId":"22",
    "keyPath":"d7b3606487c35ca78f35f0542fc08df569c2c36263b84c4fdfe3c0dbcc0525dc",
    "mnemonic":"observe injury wasp verify found dream addict leaf produce section royal trim"
 }'
```
**Result**
```
{
    "data": "d7b3606487c35ca78f35f0542fc08df569c2c36263b84c4fdfe3c0dbcc0525dc_5Ck4ncvuGDXcWJx3xVJQn61nt3cox9R3DU2ApLBEgVMFbcS9",
    "signature": "0x72531ec0aa0fc4d06b2e40662082969185a87820dbc8bbe09fdfee9be10b3b664b2c62e6ecff6ce16e31f3bb40067c1967c2e42524dcdf3889616aaface65c81",
    "zip": "https://ipfs.ternoa.dev/ipfs/QmV6gNreA9habpGVPNk39an9SkErWy9vdRMjBX6u6um5UY",
    "nftId": "22"
}
```
**Developer Endpoint**
```
  app.post("/api/signPasswordRequest", controller.signPasswordRequest);
```