### [Transfer owned NFT to another account](./api.md)
Send a NFT gift from your NFT to some specific account.

The NFT object is built as a key / value object. 

Each key is the NFT Id that will be transfered and the corresponding value is the recipient account public address.

In this example, the NFT Id 1 will be transfered to the "5Ck4ncvuGDXcWJx3xVJQn61nt3cox9R3DU2ApLBEgVMFbcS9" address.


**Call**
```
curl --request POST \
  --url https://sdkdev.ternoa.dev/api/transferNftBatch \
  --header 'Content-Type: application/json' \
  --data '{
    "nftsObject":{
      "1":"5Ck4ncvuGDXcWJx3xVJQn61nt3cox9R3DU2ApLBEgVMFbcS9"

    },
    "mnemonic":"observe injury wasp verify found dream addict leaf produce section royal trim"
}'
```
**Result**
```
ok
```
**Developer Endpoint**
```
app.post("/api/transferNftBatch", controller.transferNftBatch);
```