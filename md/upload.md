### [Upload NFT public media to IPFS](./api.md)
Upload the NFT public media. All users will be able to access to it.

:warning: Series: If you are creating a NFT serie, you only have to create a unique public media !


**Call**
```
curl --request POST \
  --url https://sdkdev.ternoa.dev/api/uploadIM \
  --header 'Content-Type: multipart/form-data; boundary=---011000010111000001101001' \
  --form file=@/Users/ternoa/Downloads/example.png
```
**Result**
```
{
  "url":"https://ipfs.ternoa.dev/ipfs/QmbpbxLWeFM2LziPLrQNWTNXp5rT6enbptrFMvQii18dk1",
  "mediaType":"image/jpeg"
}
```
**Developer Endpoint**
```
app.post("/api/uploadIM", controller.uploadIM);
```