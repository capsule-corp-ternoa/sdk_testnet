### [Sell NFT on Secret NFT MarketPlace](./api.md)
List NFT on Secret NFT Market Place

**Call**
```
curl --request POST \
  --url https://sdkdev.ternoa.dev/api/sellNFT \
  --header 'Content-Type: application/json' \
  --data '{
    "nftId":22,
    "capsPrice": 10,
    "tiimePrice": 5
    "mnemonic":"observe injury wasp verify found dream addict leaf produce section royal trim"
}'
```
**Result**
```
ok
```
**Developer Endpoint**
```
app.post("/api/sellNFT", controller.sellNFT);
```