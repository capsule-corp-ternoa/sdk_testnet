### [Burn NFT from TERNOA chain](./api.md)
Burn NFT

**Call**
```
curl --request POST \
  --url https://sdkdev.ternoa.dev/api/burnNft \
  --header 'Content-Type: application/json' \
  --data '{
    "nftId":22,
    "mnemonic":"observe injury wasp verify found dream addict leaf produce section royal trim"
}'
```
**Result**
```
{
    "nftId": "22"
}
```
**Developer Endpoint**
```
  app.post("/api/burnNFT", controller.burnNFT);
```