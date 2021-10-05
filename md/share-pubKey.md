### [Share SDK public Key on IPFS](./api.md)
Send SDK public key to IPFS

**Call**
```
curl --request GET \
  --url https://sdkdev.ternoa.dev/api/shareMyKey \
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
  app.post("/api/shareMyKey", controller.shareMyKey);
```