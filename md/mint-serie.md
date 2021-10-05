### [Mint a NFT serie on Ternoa Chain](./mint.md)
Now your NFT serie is ready to deploy on Ternoa chain's. 

The serie parameter is the "nftList" collection. 

It will contain objects of "nftUrl" (NFT IPFS link retrieved previously) and the "fileHash" for each item set as unique property of a "cryptedMedia" object.
> :warning: The fileHash parameter will have the crypted media fileHash value generally. 
> <br/>In some cases, it can be overriden to link different NFTs items (having different crypted NFTs files) to the same serie. 
> <br/> That means NFTs having the same fileHash will always belong to the same serie.


**Call**
```
curl --request POST \
  --url https://sdkdev.ternoa.dev/api/createNftBatch \
  --header 'Content-Type: application/json' \
  --data '{
    "nftList":[
        { 
            "nftUrl":"https://ipfs.ternoa.dev/ipfs/Qma1nkwhTbtmBEzED5WHbWQkc5Lh79UAXVQvvinsA2iVVa",
            "cryptedMedia": {
                "fileHash":"1a73c2f745fae6ae6d20516ee91437577d5798184253ed6e3c15996d40ee874b"
            }
        },
        { 
            "nftUrl":"https://ipfs.ternoa.dev/ipfs/Qma1nkwhTbtmBEzED5WHbWQkc5Lh79UAXVQvvinsA2iVVb",
            "cryptedMedia": {
                "fileHash":"1a73c2f745fae6ae6d20516ee91437577d5798184253ed6e3c15996d40ee874b"
            }
        }

    ],
    "mnemonic":"observe injury wasp verify found dream addict leaf produce section royal trim"
 }'
```
**Result**
```
{
    "nftIds": [
        "1",
        "2"
    ]
}
```
On Ternoa Chaos Net, you can follow the NFT creating event.
![](https://i.imgur.com/z1qo7ZT.png)
![](https://i.imgur.com/46dMysM.png)
**Developer Endpoint**
```
app.post("/api/createNftBatch", controller.createNftBatch);
```