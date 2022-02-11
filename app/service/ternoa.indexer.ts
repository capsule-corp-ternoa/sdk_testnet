import {
    request,
    gql
} from "graphql-request";


const requestIndexer = (gqlQuery:any) => request(process.env.INDEXER_URL as string, gqlQuery);

const nftByIdGql = (id:number) => gql `
{
    nftEntity(id: "${id}"){
        id,
        owner,
        listed,
        timestampBurn,
        creator,
        serieId,
        createdAt,
        nftIpfs,
        capsuleIpfs,
        price,
        timestampList,
        currency,
        marketplaceId,
        isCapsule,
}
nftTransferEntities(
  orderBy: [TIMESTAMP_DESC]
  first:1
  filter: { 
            and : [
              {nftId:{equalTo:"${id}"}}
              {typeOfTransaction:{equalTo: "transfer"}}
            ]
          } 
) {
  nodes {
    from
    to
    typeOfTransaction
    timestamp
  }
}
}
`;

const nftIdsBySeriesGql = (series:any,owner:any) => gql `
{
    nftEntities(filter: { 
    and : [
    ${owner ? `{ owner: { equalTo: "${owner}" } }` : ""}
    {serieId:{equalTo:"${series}"}}
    {timestampBurn:{isNull:true}}
    ]
  } 
      orderBy:CREATED_AT_ASC ){
      nodes{
        id
      }
totalCount
    }
  }
`;


const nftByOwnerGql = (ownerAddress:string) => gql `
{
    nftEntities(filter: { 
    and : [
    { owner: { equalTo: "${ownerAddress}" } }
    {timestampBurn:{isNull:true}}
    ]
  } 
      orderBy:CREATED_AT_ASC ){
      nodes{
        id
      }
totalCount
    }
  }
`;

const nftsByIdsGql = (ids:number[]) => gql `
{
  nftEntities(filter: { id: { in: [${ids.map(x => `"${x}",`)}] } }) {
    nodes {
      id
      owner
      listed
      timestampBurn
      creator
      serieId
      createdAt
      nftIpfs
      price
      timestampList
      currency
      marketplaceId
      isCapsule
    }
  }
}
`;

const mpByIdGql = (id:number) => gql `
{
    marketplaceEntity(id: "${id}"){
        name,
        id,
        owner,
        kind,
        uri,
}
}
`;

const mpByOwnerGql = (owner:any) => gql `
{
    marketplaceEntities(filter: { 
    and : [
    { owner: { equalTo: "${owner}" } }
    ]
  } 
      orderBy:CREATED_AT_ASC ){
      nodes{
        name,
        id,
        owner,
        kind,
        uri,
      }
    totalCount
    }
  }
`;

const mapResponseField = (requestPromise:any, responseField:any) => new Promise(async (resolve, reject) => {
    try {
        const response = await requestPromise.catch(reject);
        resolve(response[responseField]);
    } catch (e) {
        reject(e);
    }
})

export const getNftByIdWithLastOwner = async (id:any) => await requestIndexer(nftByIdGql(id))

export const getNftById = (id:any) => mapResponseField(requestIndexer(nftByIdGql(id)),'nftEntity')

export const getNftsByOwner = (id:any) => mapResponseField(requestIndexer(nftByOwnerGql(id)),'nftEntities')

export const getNftIdsBySeries = (series:any,owner:any = null) => mapResponseField(requestIndexer(nftIdsBySeriesGql(series,owner)),'nftEntities')

export const getNftsByIds = (ids:number[]) => mapResponseField(requestIndexer(nftsByIdsGql(ids)),'nftEntities')

export const getMpById = (id:any) => mapResponseField(requestIndexer(mpByIdGql(id)),'marketplaceEntity')

export const getMpByOwner = (owner:any) => mapResponseField(requestIndexer(mpByOwnerGql(owner)),'marketplaceEntities')

