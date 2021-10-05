const {
    request,
    gql
} = require("graphql-request");
const indexerUrl = process.env.INDEXER_URL;

const requestIndexer = gqlQuery => request(indexerUrl, gqlQuery);

const nftByIdGql = id => gql `
{
    nftEntity(id: "${id}"){
        id,
        owner,
        listed,
        timestampBurn,
        creator,
        serieId,
        createdAt,
        uri,
        price,
        timestampList,
        currency,
        marketplaceId
}
}
`;
const mapResponseField = (requestPromise, responseField) => new Promise(async (resolve, reject) => {
    try {
        const response = await requestPromise.catch(reject);
        resolve(response[responseField]);
    } catch (e) {
        reject(e);
    }
})
exports.getNftById = id => mapResponseField(requestIndexer(nftByIdGql(id)),'nftEntity')