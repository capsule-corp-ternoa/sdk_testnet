### [Upload NFT secret media for encryption to IPFS server](./api.md)
Upload NFT encrypted via AES-256 algorithm secret media to IPFS.

:warning: Series: If you aim to create a NFT-serie, you have to run this request as many times as needed for your serie.

:arrow_right:	For a 10 NFT serie, run this cryptFile request 10 times keeping each SDK response for the next steps. 


**Call**
```
curl --request POST \
  --url https://sdkdev.ternoa.dev/api/cryptFile \
  --header 'Content-Type: multipart/form-data; boundary=---011000010111000001101001' \
  --form file=@/Users/ternoa/Downloads/example.png
```
**Result**
```
{
  "file":"https://ipfs.ternoa.dev/ipfs/QmedkU94CPWrvMKgYw25pSxUipXTpBeq9nctAgt3HiPtGN",
  "fileHash":"1a73c2f745fae6ae6d20516ee91437577d5798184253ed6e3c15996d40ee874b",
  "keyPath":"d7b3606487c35ca78f35f0542fc08df569c2c36263b84c4fdfe3c0dbcc0525dc",
  "cryptedMediaType":"image/jpeg"
}
```
**Developer Endpoint**
```
app.post("/api/cryptFile", controller.cryptFile);
```