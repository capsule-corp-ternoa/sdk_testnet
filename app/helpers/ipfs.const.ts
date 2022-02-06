const ipfsNodes = {
    cloudfareIpfsBaseUrl: `https://cloudflare-ipfs.com`,
    ternoaIpfsBaseUrl: `https://ipfs-dev.ternoa.dev`
}

export const ipfsBaseUrl=() =>{return process.env.IPFS_GATEWAY_BASE_URL ||ipfsNodes.ternoaIpfsBaseUrl }
export const ipfsGatewayUri=() => { return `${ipfsBaseUrl()}/ipfs`;}
