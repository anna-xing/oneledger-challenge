const {registeredCurrencies, MutualTxType, UNKNOWN, TxTypeCode, ONSTx, OLT_DECIMAL} = require("./config");
const cloneDeep = require("lodash/cloneDeep");
const {ErrorType, ErrorUtil} = require("middle_utility").TierError;
const {requestErrors} = ErrorType;

const chainIdPropName = 'chainID';

// check if input is an Integer including 0, return true if so, otherwise return false
function isInteger(num) {
    if (num === 0) return true;
    if (!Number(num)) return false;
    const strNum = num.toString();
    return strNum.indexOf(".") === -1
}

// check if input is a valid block number, return true if so, otherwise return false
function isValidBlockHeight(num) {
    return isInteger(num)
}

// check if input is a valid result limit number, 0 does not included
function isValidResultLimitNum(num) {
    return isPositiveInteger(num)
}

// check if input is a positive Integer
function isPositiveInteger(num) {
    if (!Number(num) || num <= 0) return false;
    const strNum = num.toString();
    return strNum.indexOf(".") === -1
}

// check if input is a non negative Integer
function isNonNegativeInteger(num) {
    return !!(Number(num) === 0 || isPositiveInteger(num));
}

// check if input is empty, return true if str is empty, otherwise return false
function isEmpty(str) {
    return (typeof str === "undefined" || str === null || str === "");
}

// attach totalPage with the response object
function returnTotalPageStructure(returnObj, index) {
    returnObj["totalPage"] = index;
    return returnObj
}

// check if OLT address is valid, if so, return true
function isValidOLTAddress(addr) {
    return !(!isValidString(addr) || !addr.startsWith("0lt") || addr.length !== 43)
}

// check if a string is either undefined, "", null or "<nil>", if so return false
function isValidString(str) {
    return !(typeof str === "undefined" || str === "" || str === "<nil>" || str === null)
}

// check if a string can be convert to a number, if so return true
function isValidNumber(str) {
    return !isNaN(Number(str));
}

// check if amount is a string of BigInt
function isBigIntString(amount) {
    return (isValidString(amount) && isValidNumber(amount) && amount.indexOf(".") === -1)
}

// convert string of BigInt with currency decimal to string of int or float
// if amount is not a valid number, return ""
function responsePriceConverter(amount, decimal) {
    if (!isBigIntString(amount) || !isValidString(decimal) || !isValidNumber(decimal)) return "";
    let re;
    if (amount.length > decimal) {
        re = amount.substring(0, amount.length - decimal) + "." + amount.substring(amount.length - decimal, amount.length);
    } else if (amount.length === decimal) {
        re = "0." + amount
    } else {
        re = "0." + "0".repeat(decimal - amount.length) + amount
    }
    // truncate the rest of "0" after
    let cut = 0;
    let endIndex = 0;
    if (re.indexOf(".") !== -1) endIndex = re.indexOf(".");
    for (let i = re.length - 1; i >= endIndex; i--) {
        if (re[i] === "0" || re[i] === ".") cut++;
        else break;
    }
    return re.substring(0, re.length - cut)
}

// check if response send amount is valid that ending with registered currency
// example : "1000000 OLT" will return true, "100000 ABC" will return false if "ABC" is not a registered currency
// need to update registeredCurrencies in config.js
function isSendAmountValid(amount) {
    if (!isValidString(amount)) return false;
    for (let i = 0; i < registeredCurrencies.length; i++) {
        if (amount.endsWith(registeredCurrencies[i])) return true;
    }
    return false;
}

// parse recipient's receiving amount value and address from recipients array
async function parseRecipientsArray(recipients) {
    if (!Array.isArray(recipients)) return [];
    const flattenedRecipientsList = [];
    await recipients.forEach(recipient => {
        // returned obj standard of recipient's received value and address
        const obj = {
            txValue: "",
            txTo: ""
        };
        const {amount} = recipient || "0 OLT";
        if (!isSendAmountValid(amount)) {
            obj.txValue = "0 OLT"// if send amount if not valid, use default currency
        }

        // if amount is BigInt string, use else portion
        // else {
        //     obj.txValue = responsePriceConverter(amount.substring(0, amount.length - (OLT_DECIMAL.currency.length + 1)), OLT_DECIMAL.decimal) + " OLT"
        // }
        // if amount has been parsed (not BigInt string), use amount directly
        obj.txValue = amount;

        const {account} = recipient || "";
        obj.txTo = account;
        flattenedRecipientsList.push(obj);
    });
    return flattenedRecipientsList;
}

// sendTxTypeDeterminator will return proper tx type code based on SEND tx type and  amount currency
// currently support SEND and DOMAIN_SEND
function sendTxTypeDeterminator({isSend2Domain = "", isFrom = "", txValue = ""}) {
    const [value, currency] = txValue.split(" ");
    // key is isSend2Domain + isFrom + currency
    const txCodeMapping = {
        ["false" + "true" + "ETH"]: TxTypeCode.SEND_SENDER_OETH,
        ["false" + "true" + "OLT"]: TxTypeCode.SEND_SENDER_OLT,
        ["false" + "false" + "ETH"]: TxTypeCode.SEND_RECIPIENT_OETH,
        ["false" + "false" + "OLT"]: TxTypeCode.SEND_RECIPIENT_OLT,
        ["true" + "true" + "ETH"]: TxTypeCode.DOMAIN_SEND_SENDER_OETH,
        ["true" + "true" + "OLT"]: TxTypeCode.DOMAIN_SEND_SENDER_OLT,
        ["true" + "false" + "ETH"]: TxTypeCode.DOMAIN_SEND_RECIPIENT_OETH,
        ["true" + "false" + "OLT"]: TxTypeCode.DOMAIN_SEND_RECIPIENT_OLT
    };
    return txCodeMapping[isSend2Domain.toString() + isFrom.toString() + currency] || TxTypeCode.UNKNOWN
}

// ONSTxTypeDeterminator will return proper tx type code based on ONS tx type
// ONSTxType:
//  0: domain put on/off sell; 1: domain purchase
function onsTxTypeDeterminator({ONSTxType = "", isFrom = "", cancelSale = ""}) {
    // key is isSend2Domain + isFrom + currency
    const txCodeMapping = {
        [MutualTxType.DOMAIN_SELL + "true" + "false"]: TxTypeCode.DOMAIN_ON_SALE,
        [MutualTxType.DOMAIN_SELL + "true" + "true"]: TxTypeCode.DOMAIN_OFF_SALE,
        [MutualTxType.DOMAIN_PURCHASE + "false" + ""]: TxTypeCode.DOMAIN_PURCHASE_SELLER,
        [MutualTxType.DOMAIN_PURCHASE + "true" + ""]: TxTypeCode.DOMAIN_PURCHASE_BUYER,
    };
    return txCodeMapping[ONSTxType.toString() + isFrom.toString() + cancelSale.toString()] || TxTypeCode.UNKNOWN
}

function txValueDeterminator({txType = "", isFrom = "", txValue = ""}) {
    const txValueMapping = {
        [MutualTxType.DOMAIN_SELL + "true"]: "",
        [MutualTxType.DOMAIN_PURCHASE + "true"]: showNegative(txValue),
        [MutualTxType.SEND + "true"]: showNegative(txValue),
        [MutualTxType.DOMAIN_SEND + "true"]: showNegative(txValue),
    };

    const value = txValueMapping[txType.toString() + isFrom.toString()];
    if (value === undefined) {
        return txValue
    }
    return value
}

function txTypeCodeMapping(txArray, queryAddress) {
    if (txArray.length === 0) return txArray;
    const typeCodeTxArray = deepCloneObject(txArray);
    typeCodeTxArray.forEach(tx => {
        const {txFrom = "", txTo = "", txType = UNKNOWN, txOriginalValue = ""} = tx;
        const {txDetail = {}} = tx;
        const {cancelSale = ""} = txDetail;

        // tx type mapping if query address is the sender
        if (txFrom === queryAddress) {
            switch (txType) {
                case MutualTxType.SEND:
                    tx.txType = sendTxTypeDeterminator({isSend2Domain: false, isFrom: true, txValue: txOriginalValue});
                    break;
                case MutualTxType.DOMAIN_SEND:
                    tx.txType = sendTxTypeDeterminator({isSend2Domain: true, isFrom: true, txValue: txOriginalValue});
                    break;
                case MutualTxType.DOMAIN_SELL:
                    tx.txType = onsTxTypeDeterminator({ONSTxType: txType, isFrom: true, cancelSale: cancelSale});
                    break;
                case MutualTxType.DOMAIN_PURCHASE:
                    tx.txType = onsTxTypeDeterminator({ONSTxType: txType, isFrom: true, cancelSale: ""});
                    break;
                default:
                    tx.txType = TxTypeCode[txType]
            }
        }
        // tx type mapping if query address is the recipient
        if (txTo === queryAddress) {
            switch (txType) {
                case MutualTxType.SEND:
                    tx.txType = sendTxTypeDeterminator({isSend2Domain: false, isFrom: false, txValue: txOriginalValue});
                    break;
                case MutualTxType.DOMAIN_SEND:
                    tx.txType = sendTxTypeDeterminator({isSend2Domain: true, isFrom: false, txValue: txOriginalValue});
                    break;
                case MutualTxType.DOMAIN_PURCHASE:
                    tx.txType = onsTxTypeDeterminator({ONSTxType: txType, isFrom: false, cancelSale: ""});
                    break;
                default:
                    tx.txType = TxTypeCode[txType]
            }
        }
        if (txFrom === txTo && txType === MutualTxType.DOMAIN_PURCHASE) {
            tx.txType = TxTypeCode.DOMAIN_PURCHASE_SELF
        }
        tx.txType = typeof tx.txType === "undefined" ? TxTypeCode.UNKNOWN : tx.txType
    });
    return typeCodeTxArray
}

function txValueMapping(txArray, queryAddress) {
    if (txArray.length === 0) return txArray;
    const txValueTxArray = deepCloneObject(txArray);
    txValueTxArray.forEach(tx => {
        const {txFrom = "", txType = UNKNOWN, txValue = ""} = tx;
        tx.txOriginalValue = txValue;
        tx.txValue = txValueDeterminator({txType: txType, isFrom: txFrom === queryAddress, txValue: txValue})
    });
    return txValueTxArray
}

/**
 * @description parse account transaction history array
 */
async function parseAccountTxsResult(result) {
    const {txs} = result || [];
    if (txs.length === 0) return txs;
    let accountTxList = [];
    for (const tx of txs) {
        const returnObjTx = {
            txHash: tx.hash,
            txType: tx.type,
            txFrom: tx.from,
            currentHeight: tx.blockHeight, // this is not the current height, this is height that the tx belongs to, but impact is big on wallet side, we might need to make it right later
            memo: tx.memo,
            txDetail: tx.txDetail,
            chainID: tx.chainID
        };

        // parse fee object
        const {fee} = tx;
        let {amount} = fee || "0 OLT";
        const {gas} = fee || 0;
        if (!isSendAmountValid(amount)) {
            amount = "0 OLT";// if send amount if not valid, use default currency
        }
        // if amount is BigInt string, use else portion
        // else {
        //     amount = responsePriceConverter(amount.substring(0, amount.length - (OLT_DECIMAL.currency.length + 1)), OLT_DECIMAL.decimal) + " OLT";
        // }
        // if amount has been parsed (not BigInt string), use amount directly
        returnObjTx["gasPrice"] = amount;
        returnObjTx["gasUsed"] = gas;
        returnObjTx["totalFee"] = await calculateFee(gas, amount).catch(err => {
            return Promise.reject(err)
        });

        // parse recipients list
        const {recipients} = tx || [];
        const recipientsArrayObj = await parseRecipientsArray(recipients).catch(err => {
            return requestErrors.ParseRecipientsArray
        });
        for (const each of recipientsArrayObj) {
            const newReturnObjTx = await deepCloneObject(returnObjTx);
            await accountTxList.push({...newReturnObjTx, ...each})
        }
    }
    return Promise.resolve(accountTxList)
}

// calculateFee calculates total tx fee by gas * gasPrice, this will also check and parse fee currency if it's OLT
async function calculateFee(gas = "0", gasPrice = "0") {
    let feeCurrency;
    let totalFee;
    try {
        [price, feeCurrency] = gasPrice.split(" ");
        totalFee = parseFloat(gas) * parseFloat(price)
    } catch (err) {
        const returnErr = requestErrors.ParseTxGasAndGasPriceError;
        returnErr.detail = `failed to parse tx gas and gas price: ${err}`;
        return Promise.reject(ErrorUtil.errorWrap(returnErr))
    }
    if (feeCurrency !== OLT_DECIMAL.currency) return Promise.reject(ErrorUtil.errorWrap(requestErrors.FeeCalculationError));
    return Promise.resolve(`${totalFee} ${OLT_DECIMAL.currency}`)
}

// object clone
function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj))
}

// deep object clone
function deepCloneObject(obj) {
    return cloneDeep(obj)
}

/**
 * @description Parse domainName from hex string to string for ONS txs
 */
function parseONSDomainName(txs) {
    if (txs.length === 0) return txs;
    const onsDomainNameTxs = deepCloneObject(txs);
    for (let tx of onsDomainNameTxs) {
        const {txType, txTo} = tx;
        if (Object.values(ONSTx).includes(txType)) tx.txTo = txTo;
    }
    return onsDomainNameTxs
}

/**
 * @description hex string to string
 */
function hexToString(hexDomainName) {
    if (hexDomainName.startsWith("0x")) return Buffer.from(hexDomainName.slice(2,), 'hex').toString('utf-8');
    return Buffer.from(hexDomainName, 'hex').toString('utf-8')
}

/**
 * @description check if url already contains chainID param, add given non empty chainID if not exists
 */
function urlChainIDHepler(url, chainID) {
    const finalUrl = new URL(url);
    const existingChainID = finalUrl.searchParams.get(chainIdPropName);
    if (!isEmpty(chainID) && !existingChainID) {
        finalUrl.searchParams.append(chainIdPropName, chainID)
    }
    return finalUrl
}

function showNegative(value) {
    return value === "" ? "" : `(-${value})`
}

module.exports = {
    isInteger,
    returnTotalPageStructure,
    isValidBlockHeight,
    isValidResultLimitNum,
    isEmpty,
    isValidOLTAddress,
    isNonNegativeInteger,
    isPositiveInteger,
    txTypeCodeMapping,
    txValueMapping,
    isValidString,
    parseAccountTxsResult,
    isSendAmountValid,
    parseONSDomainName,
    hexToString,
    sendTxTypeDeterminator,
    urlChainIDHepler
};
