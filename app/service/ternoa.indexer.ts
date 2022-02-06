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
}
`;

const nftIdsBySeriesGql = (series:any,user:any) => gql `
{
    nftEntities(filter: { 
    and : [
    { owner: { equalTo: "${user}" } }
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

const mapResponseField = (requestPromise:any, responseField:any) => new Promise(async (resolve, reject) => {
    try {
        const response = await requestPromise.catch(reject);
        resolve(response[responseField]);
    } catch (e) {
        reject(e);
    }
})

export const getNftById = (id:any) => mapResponseField(requestIndexer(nftByIdGql(id)),'nftEntity')

export const getNftsByOwner = (id:any) => mapResponseField(requestIndexer(nftByOwnerGql(id)),'nftEntities')

export const getNftIdsBySeries = (series:any,user:any) => mapResponseField(requestIndexer(nftIdsBySeriesGql(series,user)),'nftEntities')

export const getNftsByIds = (ids:number[]) => mapResponseField(requestIndexer(nftsByIdsGql(ids)),'nftEntities')