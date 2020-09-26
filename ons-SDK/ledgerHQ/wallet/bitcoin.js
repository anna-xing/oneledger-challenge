const Btc = require("@ledgerhq/hw-app-btc").default;

const util = require("../../util");
const {ErrorType, ErrorUtil} = require("middle_utility").TierError;
const {requestErrors} = ErrorType;

const btcAddrBasePath = {
    legacy: "m/44'/0'/0'/0/",
    p2sh: "m/49'/0'/0'/0/",
    bech32: "m/173'/0'/0'/0/"
};

/**
 * LedgerHQ Bitcoin wallet
 */
class Bitcoin {
    /**
     * @description init btc wallet
     * @param transport {Object} transport object
     * Web version of transport needs to get from oneledger/ledger-sdk-web repo https://github.com/Oneledger/ledger-sdk-web
     * Node version of transport needs to get from oneledger/ledger-sdk-node repo https://github.com/Oneledger/ledger-sdk-node
     */
    constructor(transport) {
        try {
            this.btc = new Btc(transport)
        } catch (err) {
            throw Error("failed to establish the connection to the BitCoin wallet")
        }
    }

    /**
     * @description fetch btc address with public key
     * @param keyIndex {number} non-negative integer
     * @param verify {boolean} whether ask user to confirm the address on the device, default is true
     * @param format {string} address format, "legacy" | "p2sh" | "bech32", default is "legacy"
     */
    getAddrPubKey(keyIndex, verify = true, format = "legacy") {
        if (!format in btcAddrBasePath) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidBitcoinAddressFormatLedgerHQ));
        if (!Number.isInteger(keyIndex) || Number(keyIndex) < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidKeyIndex));
        return this.btc.getWalletPublicKey(btcAddrBasePath[format] + keyIndex, {verify, format}).then(response => {
            const {bitcoinAddress, publicKey, chainCode} = response;
            return Promise.resolve(ErrorUtil.responseWrap({
                address: bitcoinAddress,
                publicKey: publicKey
            }));
        }).catch(err => {
            if (err.statusCode === 27010) err.message = `wallet application is not opened`;
            if (err.statusCode === 27904) err.message = `wallet does not match the request`;
            const returnErr = requestErrors.FailToGetBitcoinAddrLedgerHQ;
            returnErr.detail = `failed to get btc address: ${err.message}`;
            return Promise.reject(ErrorUtil.errorWrap(returnErr))
        })
    }

    /**
     * @description sign btc tx
     * @param keyIndex {number} non-negative integer
     * @param rawTxHex {string} hexed raw tx with 0x prefix
     * @param format {string} address format, "legacy" | "p2sh" | "bech32", default is "legacy"
     */
    signTransaction(keyIndex, rawTxHex, format = "legacy") {
        if (!format in btcAddrBasePath) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidBitcoinAddressFormatLedgerHQ));
        if (!Number.isInteger(keyIndex) || Number(keyIndex) < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidKeyIndex));
        if (!util.isValidString(rawTxHex) || !rawTxHex.startsWith("0x")) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidBTCRawTxLedgerHQ));
        return this.btc.signMessageNew(btcAddrBasePath[format] + keyIndex, rawTxHex.substr(2)).then(response => {
            const {s, v, r} = response;
            const vd = v + 27 + 4;
            const signature = Buffer.from(vd.toString(16) + r + s, 'hex').toString('base64');
            return Promise.resolve(ErrorUtil.responseWrap({
                signature
            }))
        }).catch(function (err) {
            if (err.statusCode === 27904) err.message = `wallet does not match the request`;
            const returnErr = requestErrors.FailedToSignBTCTxLedgerHQ;
            returnErr.detail = `failed to sign btc tx: ${err.message}`;
            return Promise.reject(ErrorUtil.errorWrap(returnErr))
        })
    }
}

module.exports = {
    Bitcoin
};
