## [Request Hosting Public Key](./api.md)
Asking to server the public key

**Call**
```
curl --request POST \
  --url https://sdkdev.ternoa.dev/api/servePublicKey \
  --header 'Content-Type: application/json'
```
**Result**
```
{
    "url": "https://ipfs.ternoa.dev/ipfs/QmWs8ybvnJHrKDtRx3KXfVDPVWf5Ez5cS1PnKeBDHw68Br"
}
```
**Developer Endpoint**
```
  app.post("/api/servePublicKey", controller.servePublicKey);
```