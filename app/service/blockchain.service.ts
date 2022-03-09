import { KeyringPair } from "@polkadot/keyring/types";
import { txActions, txPallets } from "../const/tx.const";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import Keyring, { decodeAddress, encodeAddress } from '@polkadot/keyring';
import axios from 'axios';
import { hexToU8a, isHex, BN_TEN, u8aToHex } from '@polkadot/util';
import BN from 'bn.js';

let api: any = null;
let userAddress: any = null;
let balance: any = null;
let accountWalletSub: any = null;

const getChainSpec = () => axios.get(`${process.env.COMMON_API_URL}/chaintypes${process.env.CHAIN_SPEC ? `?specVersion=${process.env.CHAIN_SPEC}` : ''}`);

export const initializeApi = async () => {
    await cryptoWaitReady();
    const CHAIN_ENDPOINT = process.env.CHAIN_ENDPOINT;
    const wsProvider = new WsProvider(CHAIN_ENDPOINT);
    const spec = await getChainSpec();

    const types = spec.data;
    api = await ApiPromise.create({
        provider: wsProvider,
        types
    });
    return api;
}

export const getApi = async () => {
    if (!api || !api.isConnected) {
        //console.log('creating chain api')
        api = await initializeApi();
    }

    return api;
}

export const isValidAddress = (address: string) => {
    try {
        encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));
        return true;
    } catch (error) {
        return false;
    }
};

const getAddress = async (addresssOrSeed: string) => {
    //check if address
    if (isValidAddress(addresssOrSeed)) {
        encodeAddress(isHex(addresssOrSeed) ? hexToU8a(addresssOrSeed) : decodeAddress(addresssOrSeed));
        return addresssOrSeed
    } else {
        let user = await getUserFromSeed(addresssOrSeed)
        return user.address
    }
}

export const getBalance = async (addresssOrSeed: string) => {
    let currentUserAddress = await getAddress(addresssOrSeed);
    if (userAddress != currentUserAddress) {
        if (accountWalletSub && typeof accountWalletSub === 'function') {
            accountWalletSub();
            //add delay?
        }
    }

    if (!(accountWalletSub && typeof accountWalletSub === 'function')) {
        const api = await getApi()
        if (api) {
            userAddress = currentUserAddress
            accountWalletSub = await api.query.system.account(currentUserAddress)
            const { free } = accountWalletSub.data;
            balance = (Number(unFormatBalance(free)) / Math.pow(10, 18))
        } else {
            return 0
        }
    }
    return balance
}

export const getNFTMintPrice = async () => {

    const nftMintPrice = await (await getApi()).query.nfts.nftMintFee();
    balance = (Number(unFormatBalance(nftMintPrice)) / Math.pow(10, 18))
    return balance
}

export const getMarketplaceMintPrice = async () => {
    const MarketplaceMintPrice = await (await getApi()).query.marketplace.marketplaceMintFee();
    balance = (Number(unFormatBalance(MarketplaceMintPrice)) / Math.pow(10, 18))
    return balance
}

export const getMPMintPrice = async () => {
    const mpMintPrice = await (await getApi()).query.marketplace.marketplaceMintFee();
    balance = (Number(unFormatBalance(mpMintPrice)) / Math.pow(10, 18))
    return balance
}

export const getCapsuleMintPrice = async () => {
    const capsuleMintPrice = await (await getApi()).query.capsules.capsuleMintFee();
    balance = (Number(unFormatBalance(capsuleMintPrice)) / Math.pow(10, 18))
    return balance
}

export const getExtrinsicFee = async () => {
    const extrinsicsFee = await (await getApi()).query.transactionPayment.nextFeeMultiplier();
    balance = (Number(unFormatBalance(extrinsicsFee)) / Math.pow(10, 18))
    return balance
}

export const safeDisconnect = () => {
    if (api && api.isConnected) {
        api.disconnect();
    }
}

export const formatChainData = (data: any) => JSON.parse(JSON.stringify(data));

export const getUserFromSeed = async (seed: string) => {
    try{
        const keyring = new Keyring({ type: 'sr25519' })
        await cryptoWaitReady();
        return keyring.createFromUri(seed);
    }catch(err){
        console.log('getUserFromSeed: err:', err)
        throw new Error("invalid seed")
    }
}

export const getSignature = (sender: any, data: any) => u8aToHex(sender.sign(data));

export const getSgxNodes = async () => {
    const sgxList = await (await getApi()).query.sgx.enclaveRegistry.entries();
    return sgxList.map((sgxItem: Array<any>) => {
        return {
            id: Number(sgxItem[0].args),
            url: formatChainData(sgxItem[1].value).api_url,
        };
    });
};

const getTransaction = async (txPallet: txPallets, txAction: txActions, txArgs: any[], txBatch: boolean, extraTransactions: any[] = []): Promise<any> => {
    const _api = await getApi();
    // //console.info('getTransaction', txPallet, txAction, txArgs, txBatch, extraTransactions);
    if (txBatch || extraTransactions.length > 0) {
        if (txArgs && !Array.isArray(txArgs)) {
            txArgs = [txArgs];
        }
        //console.info('batch', txPallet, txAction, txArgs, extraTransactions);
        const mainTransactions = await Promise.all(txArgs.map(async (txBatchArg) => await getTransaction(txPallet, txAction, txBatchArg, false)));
        const additionalTransactions = await Promise.all(extraTransactions.map(async (extraTransactionArgs) => await getTransaction(...extraTransactionArgs as [txPallets, txActions, any[], boolean, any[]?])));
        const batchTransactions = [...additionalTransactions, ...mainTransactions];
        // //console.info('batchTransactions', batchTransactions);
        return _api.tx.utility.batch(batchTransactions);
    } else {
        //console.info('single', txPallet, txAction, txArgs, txBatch);
        if (txArgs && !Array.isArray(txArgs)) {
            txArgs = [txArgs];
        }
        // //console.info('_api tx', _api.tx[txPallet][txAction], txArgs);
        const transaction = _api.tx[txPallet][txAction](...txArgs);
        // //console.info('single transaction', transaction);
        return transaction;
    }
};

const getErrorDetails = (dispatchError:any) => {
    if (dispatchError.isModule) {
      // for module errors, we have the section indexed, lookup
      if(api)
      return api.registry.findMetaError(dispatchError.asModule);
      else
      return 'blockchain connection failed!'
    } else {
      // Other, CannotLookup, BadOrigin, no extra info
      return dispatchError.toString();
    }
  };

const defaultExtrinsicCallback = ({ events = [], status, dispatchError }: { events: any[], status: any, dispatchError:any }, sectionMethodSuccess: string, sectionMethodError: string, txArgs: any[], txBatch: boolean, sender: KeyringPair, onSuccessEvent: Function | undefined, resolve: Function, reject: Function) => {
    // //console.info('defaultExtrinsicCallback', sectionMethodSuccess, sectionMethodError, txArgs, sender, onSuccessEvent);
    const errorDetails = dispatchError ? getErrorDetails(dispatchError) : null;
    // console.log('defaultExtrinsicCallback: errorDetails:', errorDetails)
    if (status.isRetracted) {
        const retractedStr = `Transaction isRetracted ${status.asRetracted}`;
        //console.warn(retractedStr);
    } else if (status.isInBlock) {
        const inBlockStr = `Transaction included at blockHash ${status.asInBlock}`;
        //console.info(inBlockStr);
        events.forEach(async ({ event }) => {
            const { method, section, data } = event;
            const sectMethStr = `${section}.${method}`;
            //console.info('section.method', sectMethStr);
            //console.info('data', data);
            switch (sectMethStr) {
                case sectionMethodSuccess:
                    if (!txBatch) {
                        //console.log('resolving', sectMethStr, data);
                        resolve({ event: sectMethStr, data:{...data, block:status.asInBlock} });
                    }
                    if (onSuccessEvent && typeof onSuccessEvent === 'function') {
                        onSuccessEvent({...data, block:status.asInBlock}, sender);
                    }
                    break;
                case sectionMethodError:
                    reject({ event: sectMethStr, data:{...data, block:status.asInBlock}, errorDetails});
                    break;
                case defaultBatchSectMethSuccess:
                    if (txBatch) {
                        resolve({ event: sectMethStr, data:{...data, block:status.asInBlock} });
                    }
                    break;
                case defaultBatchSectMethError:
                    if (txBatch) {
                        reject({ event: sectMethStr, data:{...data, block:status.asInBlock}, errorDetails });
                    }
                    break;
            }
        });
    } else if (status.isFinalized) {
        const finalizedStr = `Transaction finalized at blockHash ${status.asFinalized}`;
        //console.info(finalizedStr);
        resolve(finalizedStr);
    }
};
const defaultSectMethSuccess = 'system.ExtrinsicSuccess',
    defaultSectMethError = 'system.ExtrinsicFailed',
    defaultBatchSectMethSuccess = 'utility.BatchCompleted',
    defaultBatchSectMethError = 'utility.BatchInterrupted';
export const runTransaction = async (
    txPallet: txPallets,
    txAction: txActions,
    sender: KeyringPair,
    txArgs: any[],
    txBatch: boolean = false,
    sectionMethodSuccess = txBatch ? defaultBatchSectMethSuccess : defaultSectMethSuccess,
    sectionMethodError = txBatch ? defaultBatchSectMethError : defaultSectMethError,
    transactionCallback = defaultExtrinsicCallback,
    onSuccessEvent = undefined,
    extraTransactions = [],
): Promise<any> => {
    if (extraTransactions && extraTransactions.length > 0) {
        sectionMethodSuccess = defaultBatchSectMethSuccess;
        sectionMethodError = defaultBatchSectMethError;
        if (!txBatch) {
            txArgs = [txArgs];
        }
        txBatch = true;
    }
    const transaction = await getTransaction(txPallet, txAction, txArgs, txBatch, extraTransactions);
    console.log('transaction', transaction)

    console.log('transaction', transaction.toString())
    return null;
    let unsubscribe:object;
    const transactionCallbackPromise = new Promise(async (resolve, reject) => {
        unsubscribe = await transaction
            .signAndSend(sender, (response: any) => transactionCallback(response, sectionMethodSuccess, sectionMethodError, txArgs, txBatch, sender, onSuccessEvent, resolve, reject))
            .catch(reject);
    });
    transactionCallbackPromise.then(async()=>{
        if (unsubscribe && typeof unsubscribe === 'function') {
            await unsubscribe();
        }
    }).catch(async()=>{
        if (unsubscribe && typeof unsubscribe === 'function') {
            await unsubscribe();
        }
    });
    return transactionCallbackPromise;
};

export const unFormatBalance = (_input: number) => {
    const input = '' + _input;
    const siPower = new BN(api.registry.chainDecimals[0]);
    const basePower = api.registry.chainDecimals[0];
    const siUnitPower = 0;
    const isDecimalValue = input.match(/^(\d+)\.(\d+)$/);
    let result;

    if (isDecimalValue) {
        if (siUnitPower - isDecimalValue[2].length < -basePower) {
            result = new BN(-1);
        }
        const div = new BN(input.replace(/\.\d*$/, ''));
        const modString = input.replace(/^\d+\./, '').substr(0, api.registry.chainDecimals[0]);
        const mod = new BN(modString);
        result = div.mul(BN_TEN.pow(siPower)).add(mod.mul(BN_TEN.pow(new BN(basePower + siUnitPower - modString.length))));
    } else {
        result = new BN(input.replace(/[^\d]/g, '')).mul(BN_TEN.pow(siPower));
    }
    return result;
}
export const BalanceCheck = async (addressOrSeed: string, pallet: string, action: string) => {
    const userBalance = await getBalance(addressOrSeed);
    const extrinsicsFee = await getExtrinsicFee()
    switch (pallet) {
        case txPallets.nfts:
            switch (action) {
                case txActions.create:
                    const nftMintFee = await getNFTMintPrice();
                    return (userBalance > nftMintFee + extrinsicsFee)
            }
        case txPallets.marketplace:
            switch(action){
                case txActions.create:
                    const mpMintPrice=await getMarketplaceMintPrice();
                    return (userBalance > mpMintPrice + extrinsicsFee)
            }        
        case txPallets.capsules:
            switch (action) {
                case txActions.createFromNft:
                    const capsuleMintFee = await getCapsuleMintPrice();
                    return (userBalance > capsuleMintFee + extrinsicsFee)
            }
        default:
            return (userBalance > extrinsicsFee);
    }
}
export function getChainPrice(_capsPrice: number, _tiimePrice?: number) {
    const capsCombinedKey = 'caps';
    const tiimeCombinedKey = 'tiime';
    const combinedKey = 'Combined';
    const capsSingleKey = 'Caps';
    const tiimeSingleKey = 'Tiime';
    const defaultCapsPrice = 1;
    if (!_capsPrice && !_tiimePrice) {
        _capsPrice = defaultCapsPrice;
    }
    if (_capsPrice && _tiimePrice) {
        return {
            [combinedKey]: {
                [capsCombinedKey]: unFormatBalance(_capsPrice),
                [tiimeCombinedKey]: unFormatBalance(_tiimePrice),
            },
        };
    } else if (_capsPrice) {
        return {
            [capsSingleKey]: unFormatBalance(_capsPrice),
        };
    } else {
        return {
            [tiimeSingleKey]: unFormatBalance(_tiimePrice as number),
        };
    }
}