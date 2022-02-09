export enum txPallets {
    marketplace = 'marketplace',
    nfts = 'nfts',
    utility='utility',
    balances = 'balances',
    tiimeBalances = 'tiimeBalances',
    capsules = 'capsules',
    associatedAccounts = 'associatedAccounts',
};
export enum txActions {
    //marketplace
    buy = 'buy',
    list = 'list',
    unlist = 'unlist',
    //nfts
    burn = 'burn',
    create = 'create',
    transfer = 'transfer',
    finishSeries = 'finishSeries',
    batch='batch',
    
    //balances tiimebalances
    transferKeepAlive = 'transferKeepAlive',
    //capsules
    createFromNft = 'createFromNft',
    remove = 'remove',
    setIpfsReference = 'setIpfsReference',
    //associatedAccounts
    setAltvrUsername = 'setAltvrUsername',
    //marketplace
    setCommissionFee='setCommissionFee'
};
export enum chainQuery {
    nftMintFee = 'nftMintFee',
    capsuleMintFee = 'capsuleMintFee',
};

export enum txEvent {
    nftsCreated = 'nfts.Created',
    nftsBurned = 'nfts.Burned',

    nftsTransfered='nfts.Transfered',
    BatchCompleted='utility.BatchCompleted',
    CapsuleIpfsReferenceChanged='capsules.CapsuleIpfsReferenceChanged',
    CapsuleCreated='capsules.CapsuleCreated',
    CapsuleRemoved='capsules.CapsuleRemoved',
    MarketplaceCreated='marketplace.MarketplaceCreated',
    setCommissionFee='marketplace.setCommissionFee'
}
