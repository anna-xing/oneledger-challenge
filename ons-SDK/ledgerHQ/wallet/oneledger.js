const util = require("../../util");
const requestConfig = require("../../requestConfig");
const {ErrorType, ErrorUtil} = require("middle_utility").TierError;
const {requestErrors} = ErrorType;
const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
const crypto = require('crypto');
const offlineSerialize = require('../../offlineSerialization');

/**
 * LedgerHQ Oneledger wallet
 */
class Oneledger {
    /**
     * @description init oneledger wallet
     * @param transport {Object} transport object
     * Web version of transport needs to get from oneledger/ledger-sdk-web repo https://github.com/Oneledger/ledger-sdk-web
     * Node version of transport needs to get from oneledger/ledger-sdk-node repo https://github.com/Oneledger/ledger-sdk-node
     */
    constructor(transport) {
        try {
            this.transport = transport;
            transport.decorateAppAPIMethods(this, ["getAddrPubKey", "signTransaction"])
        } catch (err) {
            throw Error("failed to establish the connection to the Oneledger wallet")
        }
    }

    /**
     * @description fetch olt address with public key
     * @param keyIndex {number} non-negative integer
     * @param [verify[ {boolean} whether ask user to confirm the address on the device, default is true
     */
    getAddrPubKey(keyIndex, verify = true) {
        if (!Number.isInteger(keyIndex) || Number(keyIndex) < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidKeyIndex));
        let bufferData;
        try {
            const keyIndexHex = keyIndex.toString(16);
            const account = keyIndexHex.length > 8 ? keyIndexHex : '0'.repeat(8 - keyIndexHex.length) + keyIndexHex;
            const accountHex = (account.length + 1).toString(16);
            const frontMesss = accountHex.length > 2 ? accountHex : '0'.repeat(2 - accountHex.length) + accountHex;
            const apduMessage = frontMesss + account;
            const verifyResult = verify ? "01" : "00";
            bufferData = Buffer.from('E002' + verifyResult + '000000' + apduMessage, "hex")
        } catch (err) {
            const returnErr = requestErrors.GetAddrPubkeyErrorLedgerHQ;
            returnErr.detail = `failed to parse data for getting address and public key: ${err.message}`;
            return Promise.reject(ErrorUtil.errorWrap(returnErr))
        }
        return this.transport.exchange(bufferData).then(result => {
            if (result.length === 2) return Promise.reject(Error(`wallet application is not opened: code(${result[0]})`));
            try {
                let response = {};
                response.address = `0lt${result.slice(0, 40).toString()}`;
                response.publicKey = nacl.util.encodeBase64(Buffer.from(result.slice(40, result.length - 2).toString(), "hex"));
                return Promise.resolve(ErrorUtil.responseWrap(response))
            } catch (err) {
                return Promise.reject(Error("failed to parse address and public key"))
            }
        }).catch(err => {
            const returnErr = requestErrors.FailToGetOneledgerAddrLedgerHQ;
            returnErr.detail = `failed to get olt address: ${err.message}`;
            return Promise.reject(ErrorUtil.errorWrap(returnErr))
        })
    }

    /**
     * @description sign olt tx
     * @param keyIndex {number} non-negative integer
     * @param rawTx {string} base64 rawTx string
     */
    signTransaction(keyIndex, rawTx) {
        if (!Number.isInteger(keyIndex) || Number(keyIndex) < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidKeyIndex));
        // TODO : reuse hd-value util.validateBase64() func here
        if (!util.isValidString(rawTx)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidOLTRawTxLedgerHQ));
        let bufferData;
        try {
            // decode base64 rawTx
            const decodeRawTx = nacl.util.decodeBase64(rawTx);
            const hash = crypto.createHash('sha512');
            const sha512RawTx = hash.update(decodeRawTx, 'utf-8');
            // apply SHA512 to decoded rawTx
            const sha512RawTxHex = sha512RawTx.digest('hex');
            // unserialize rawTx to get tx payload
            const decodeTx = offlineSerialize.base64ToJsonObject(rawTx);
            const decodeTxJson = JSON.parse(decodeTx);
            const decodeTxData = offlineSerialize.base64ToJsonObject(decodeTxJson.data);
            const decodeTxDataJson = JSON.parse(decodeTxData);
            // account
            const keyIndexHex = keyIndex.toString(16);
            const account = keyIndexHex.length > 8 ? keyIndexHex : '0'.repeat(8 - keyIndexHex.length) + keyIndexHex;

            // for all other tx types, this is general buffer data for signing
            const first = ((account.length + sha512RawTxHex.length) / 2).toString(16);
            const frontMess = first.length > 4 ? first : '0'.repeat(4 - first.length) + first;
            bufferData = Buffer.from('E003010000' + frontMess + account + sha512RawTxHex, "hex");

            if (decodeTxJson.type === requestConfig.TxTypes.SEND) {
                const currency = decodeTxDataJson.amount.currency;
                const value = util.responsePriceConverter(decodeTxDataJson.amount.value.toString(), requestConfig.OLT.decimal); // convert from NUE to OLT
                const to = decodeTxDataJson.to;
                const feeValue = requestConfig.GNUE.currency + ": " + util.responsePriceConverter(decodeTxJson.fee.price.value.toString(), requestConfig.GNUE.decimal); // convert from NUE to GNUE

                const amount_str = currency + ": " + value;
                const amountHex = Buffer.from(amount_str, 'utf8').toString('hex');
                const amount = amountHex.length > 64 ? amountHex : amountHex + '0'.repeat(64 - amountHex.length);
                const recipientHex = Buffer.from(to, 'utf8').toString('hex');
                const recipient = recipientHex.length > 128 ? recipientHex : recipientHex + '0'.repeat(128 - recipientHex.length);
                const feeHex = Buffer.from(feeValue, 'utf8').toString('hex');
                const fee = feeHex.length > 64 ? feeHex : feeHex + '0'.repeat(64 - feeHex.length);
                const first = ((account.length + (sha512RawTxHex.length + amount.length + recipient.length + fee.length) / 2)).toString(16);
                const firstMess = first.length > 4 ? first : '0'.repeat(4 - first.length) + first;

                bufferData = Buffer.from("E003010100" + firstMess + account + sha512RawTxHex + amount + recipient + fee, "hex")
            }
        } catch (err) {
            const returnErr = requestErrors.FailedToParseDataAndSignOLTTxLedgerHQ;
            returnErr.detail = `failed to parse data for signing olt tx: ${err.message}`;
            return Promise.reject(ErrorUtil.errorWrap(returnErr))
        }
        return this.transport.exchange(bufferData).then(result => {
            if (result.length === 2) return Promise.reject(Error(`wallet application is not opened: code(${result[0]})`));
            try {
                const sha512Buffer = Buffer.from("SHA512", "utf-8");
                const signatureBuffer = Buffer.from(result.toString("hex").slice(2).slice(0, 128), "hex");
                const finalSignature = Buffer.concat([sha512Buffer, signatureBuffer]);
                return Promise.resolve(ErrorUtil.responseWrap({
                    signature: nacl.util.encodeBase64(finalSignature)
                }))
            } catch (err) {
                return Promise.reject(Error(`parse signature result error`))
            }
        }).catch(err => {
            const returnErr = requestErrors.FailedToSignOLTTxLedgerHQ;
            returnErr.detail = `failed to sign olt tx: ${err.message}`;
            return Promise.reject(ErrorUtil.errorWrap(returnErr))
        })
    }
}

module.exports = {
    Oneledger
};
