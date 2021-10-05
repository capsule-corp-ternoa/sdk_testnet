### [Upload NFT file to IPFS server](./create-nft.md)
Using data previously retrieved, generate your NFT

:warning: Series: Run this request as many times as needed for your serie using the unique public media data and each crypted media data.

:arrow_right:	For a 10 NFT serie, run this uploadEX request 10 times using the same unique public Media link & type every time and every crypted media data returned at cryptFile step. 


**Call**
```
curl --request POST \
  --url https://sdkdev.ternoa.dev/api/uploadEX \
  --header 'Content-Type: application/json' \
  --data '{	
    "name":"Yippee Ki Yay",
    "description":"Yippee Ki Yay from France",
    "media":"https://ipfs.ternoa.dev/ipfs/QmbpbxLWeFM2LziPLrQNWTNXp5rT6enbptrFMvQii18dk1",
    "mediaType":"image/jpeg",
    "cryptedMedia":"https://ipfs.ternoa.dev/ipfs/QmedkU94CPWrvMKgYw25pSxUipXTpBeq9nctAgt3HiPtGN",
    "cryptedMediaType":"image/jpeg",
    "fileHash":"1a73c2f745fae6ae6d20516ee91437577d5798184253ed6e3c15996d40ee874b",
    "keyPath":"d7b3606487c35ca78f35f0542fc08df569c2c36263b84c4fdfe3c0dbcc0525dc"
}'
```
**Result**
```
{
    "url": "https://ipfs.ternoa.dev/ipfs/Qma1nkwhTbtmBEzED5WHbWQkc5Lh79UAXVQvvinsA2iVVa",
    "keyPath": "d7b3606487c35ca78f35f0542fc08df569c2c36263b84c4fdfe3c0dbcc0525dc"
}
```
**Developer Endpoint**
```
app.post("/api/uploadEX", controller.uploadEX);
```