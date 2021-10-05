### [Get PGP encrypted NFT key](./api.md)
Return NFT secret key crypted with owner GPG public key.

Encrypt your secret media using [GPG algorithm](https://en.wikipedia.org/wiki/GNU_Privacy_Guard) then upload it to IPFS. 
Example of Linux based system GPG generation

*That command will generate GPG asymmetric keys and a secure password.*
```
gpg --gen-key
```
Enter username, email and passphrase. 
Once generated, you can export your public key to the output file path given:
```
gpg --output public.pgp --armor --export username@email.com
```
Now, you can use the [Upload Endpoint](./upload.md) to upload your public GPP key to IPFS and get the IPFS key URL response.

**Call**
```
curl --request POST \
  --url https://sdkdev.ternoa.dev/api/sgxRequestPassword \
  --header 'Content-Type: application/json' \
  --data '{
    "data":"22_5Ck4ncvuGDXcWJx3xVJQn61nt3cox9R3DU2ApLBEgVMFbcS9_d7b3606487c35ca78f35f0542fc08df569c2c36263b84c4fdfe3c0dbcc0525dc",
    "signature":"0x883d7d32fad3928d2a893a46570b163d0322d21c1e906c48d70605c14635002b5c6f2073875c0de512fe8b1d8f3210bc051c8f45bc549383cca862d32a48ad8f",
    "key":"https://ipfs.ternoa.dev/ipfs/QmWs8ybvnJHrKDtRx3KXfVDPVWf5Ez5cS1PnKeBDHw68Br",
    "nftId":22
  }'
```
**Data**: 

`
nftId_ownerAddress_nftKeyPath
`

**Signature** : 

Sign Data argument.

**Key** : 

IPFS GPG Public Key link. The server will encrypt the key if the owner is the current user who asking for the key.

**Result**
```
-----BEGIN PGP MESSAGE-----

wV4DwaRcaB72j+ASAQdAvd2PdCMIvFAEg3DrYj2v5KWm8XjBf17lXg9JAf+4
eS8wbMiuLQwGGRiCzFrqH2lrkR8Uz9dp0Rnt8xiHbXKaaDmATUULLsj3/urp
iasctZUN0nIBmIcl//dg/fXXEUJLULs8YKSbD23WSsP5IK7s0Y7JrNFtcH32
UhkXynWxxGTrhMo2V0ZKuHpxtIRwXCJmvB4bLCB1HFOBpLET67tPzVpH+Iy+
4ZjLtP/TaO8mDuyaNPa4KpoADgx38+lPNza2D5futUs=
=4sk2
-----END PGP MESSAGE----- 
```
**Developer Endpoint**
```
  app.post("/api/sgxRequestPassword", controller.sgxRequestPassword);
```