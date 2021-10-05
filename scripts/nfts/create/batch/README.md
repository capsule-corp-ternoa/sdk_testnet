# Batch script example
CSV_FILE_PATH="scripts/nfts/create/batch/test_batch_pgp_sgx.csv" NFT_FOLDER="../pics" CSV_DELIMITER="," IPFS_BASEURL="https://ipfs-dev.ternoa.dev" CHAIN_ENDPOINT="wss://staging.chaos.ternoa.com" SHAMIR_PATH="tmp/shamirs" npm run nft-batch
# PARAMETERS
# CSV_FILE_PATH : valid path - required - CSV with NFT data to create  
# NFT_FOLDER : valid path - required  - NFT images folder  
# CSV_DELIMITER : cell delimiter - optional  - default ;  
# CHAIN_ENDPOINT : valid WSS endpoint for blockchain - required  
# IPFS_BASEURL : valid IPFS domain url - required
# SHAMIR_PATH: shamir path to store locally when save to SGX node fails
