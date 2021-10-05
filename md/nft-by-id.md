### [Get NFT data by Id](./api.md)
Request NFT on Ternoa Blockchain by Id

**Call**
```
curl --request GET \
  --url https://sdkdev.ternoa.dev/api/nft/1 \
  --header 'Content-Type: application/json'
```
**Result**
```
{
    "id": "1",
    "nodeId": "WyJuZnRfZW50aXRpZXMiLCIxIl0=",
    "nftId": null,
    "owner": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    "listed": 0,
    "timestampBurn": null,
    "creator": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    "serieId": "0",
    "createdAt": "2021-08-19T14:33:40.55+00:00",
    "updatedAt": "2021-08-19T14:33:40.55+00:00",
    "uri": "another.com",
    "price": null,
    "priceTiime": null,
    "timestampList": null,
    "currency": "CAPS"
}
```
**Developer Endpoint**
```
  app.get("/api/nft/:id", controller.getNftData);
```

