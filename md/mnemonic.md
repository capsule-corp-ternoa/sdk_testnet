### [Generate mnemonic and public address](./api.md)
First, generate your mnemonic phrase and retrieve you public address. 

**Call**
```
curl --request GET \ 
  --url https://sdkdev.ternoa.dev/api/mnemonicGenerate
```
**Result**
```
{
  "mnemonic":"observe injury wasp verify found dream addict leaf produce section royal trim",
  "address":"5FmvpY1zJQC4wDXi1L5yqjZL5VkVtiJb7XhHcPBRpSSytFcv"
}
```
**Developer Endpoint**
```
app.get("/api/mnemonicGenerate", controller.mnemonicGenerate);
```
