const Eth = require("@ledgerhq/hw-app-eth").default;

const util = require("../../util");
const {ErrorType, ErrorUtil} = require("middle_utility").TierError;
const {requestErrors} = ErrorType;

const ethAddressKeyPathBase = "m/44'/60'/0'/0/";

/**
 * LedgerHQ Ethereum wallet
 */
class Ethereum {
    /**
     * @description init eth wallet
     * @param transport {Object} transport object
     * Web version of transport needs to get from oneledger/ledger-sdk-web repo https://github.com/Oneledger/ledger-sdk-web
     * Node version of transport needs to get from oneledger/ledger-sdk-node repo https://github.com/Oneledger/ledger-sdk-node
     */
    constructor(transport) {
        try {
            this.eth = new Eth(transport)
        } catch (err) {
            throw Error("failed to establish the connection to the Ethereum wallet")
        }
    }

    /**
     * @description fetch eth address with public key
     * @param keyIndex {number} non-negative integer
     * @param [boolDisplay] {boolean} enable or not the display, default is true
     * @param [boolChaincode] {boolean} enable or not the chaincode request, default is false
     */
    getAddrPubKey(keyIndex, boolDisplay = true, boolChaincode = false) {
        if (!Number.isInteger(keyIndex) || Number(keyIndex) < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidKeyIndex));
        return this.eth.getAddress(ethAddressKeyPathBase + keyIndex, boolDisplay, boolChaincode).then(response => {
            const {address, publicKey, chainCode} = response;
            if (address.length !== 42) return Promise.reject(Error(`wallet does not match the request`));
            return Promise.resolve(ErrorUtil.responseWrap({
                address: address,
                publicKey: publicKey
            }));
        }).catch(err => {
            if (err.statusCode === 26368) err.message = `wallet application is not opened`;
            const returnErr = requestErrors.FailToGetEthereumAddrLedgerHQ;
            returnErr.detail = `failed to get eth address: ${err.message}`;
            return Promise.reject(ErrorUtil.errorWrap(returnErr))
        })
    }

    /**
     * @description sign eth tx
     * @param keyIndex {number} non-negative integer
     * @param rawTxHex {string} hexed raw tx with 0x prefix
     */
    signTransaction(keyIndex, rawTxHex) {
        if (!Number.isInteger(keyIndex) || Number(keyIndex) < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidKeyIndex));
        if (!util.isValidString(rawTxHex) || !rawTxHex.startsWith("0x")) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidETHRawTxLedgerHQ));
        return this.eth.signTransaction(ethAddressKeyPathBase + keyIndex, rawTxHex.substr(2)).then(response => {
            const {s, v, r} = response;
            return Promise.resolve(ErrorUtil.responseWrap({
                signature: `0x${r}${s}${v}`
            }))
        }).catch(err => {
            if (err.statusCode === 26368) err.message = `wallet application is not opened`;
            const returnErr = requestErrors.FailedToSignETHTxLedgerHQ;
            returnErr.detail = `failed to sign eth tx: ${err.message}`;
            return Promise.reject(ErrorUtil.errorWrap(returnErr))
        })
    }
}

module.exports = {
    Ethereum
};
