const uuid = require('uuid/v1');
const crypto = require('crypto');
const cloneDeep = require("lodash/cloneDeep");
const offlineSerialize = require('./offlineSerialization');
const requestConfig = require("./requestConfig");
const HDVault = require("hd-vault");
const {ErrorType, errorHandler, ErrorUtil} = require("middle_utility").TierError;
const storeFs = require('./store/storeFs');
const storeBrowser = require('./store/storeBrowser');
const {sdkConfigDefaultData} = require('./store/storeDefaultData');
const {requestErrors} = ErrorType;
const KeyType = HDVault.CONSTANT.KeyType;
// domain name (with subdomain name) can only be alphanumeric and max length is 256 including suffix
const domainNamePattern = /^([a-zA-Z0-9]+\.)*[a-zA-Z0-9]+$/;
const BTC_P2PK_PUBKEY_LENGTH = 66;
const BTC_P2PKH_ADDR_LENGTH = 34;
const URLPattern = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})\/jsonrpc/;
const domainURIPattern = /(https?|ftp|ipfs):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;
const methodPattern = /.*\..*/
const storeInitFuncMapping = {
    electron: (StoreInitOpt) => new storeFs(StoreInitOpt),
    browser: (StoreInitOpt) => new storeBrowser(StoreInitOpt)
};
const RPC = require('./requestSender')

// check if a string is either undefined, "", null or "<nil>", if so return false
function isValidString(str) {
    return !(typeof str === "undefined" || str === "" || str === "<nil>" || str === null)
}

// check if a string can be convert to a number, if so return true
function isValidNumber(str) {
    return !isNaN(Number(str));
}

// check if input is string type
function isString(str) {
    return typeof str === "string"
}

// check if tracker name is valid format
function isValidTrackerName(trackerName) {
    return !(isEmpty(trackerName) || !trackerName.startsWith("0x") || trackerName.length !== 66)
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

// convert string of int or float to string of BigInt
// need to pass the field of value and currency decimal of the price object
// price obj would be like :
// price: {
//   currency: "OLT",
//   value: "12345.789"
// }
function requestPriceConverter(value, decimal) {
    // price value verify
    if (!isString(value) || !isValidString(value) || !isValidNumber(value)) return false;
    // int 0 should still be 0 in BigInt
    if (value === "0") return value;
    // let priceValue = Number(value).toString();
    const pointIndex = value.indexOf(".");
    if (pointIndex === -1) {
        value += "0".repeat(decimal);
        return value
    }
    const intPart = value.substring(0, pointIndex);
    const facPart = value.substring(pointIndex + 1, value.length);
    const result = BigInt(intPart) * BigInt(10 ** 18) + BigInt(facPart) * BigInt(10 ** (18 - facPart.length));
    return result.toString()
}

// get balance and height from input and reformat output style
function balanceHelper(response) {
    const {balance, height} = response || {};
    const returnObj = {
        balance: balance,
        height: height
    };
    let balanceReturnObj;
    try {
        balanceReturnObj = balanceWrap(returnObj);
    } catch (err) {
        return requestErrors.ParseBalanceError
    }
    return balanceReturnObj;
}

// parse sale price part of domain query reply object
// domains should be an array
async function parseDomainReply(domains, env, currentHeight = 0) {
    const domainList = [];
    for (const domain of domains) {
        // return obj mapping for query domain
        const {owner, beneficiary, name, creationHeight, lastUpdateHeight, activeFlag, onSaleFlag, salePrice, expireHeight, uri} = domain || {};
        const saleObj = parseCurrencyName(salePrice);

        // get balance
        const newOptions = deepCloneObject(requestConfig.options);
        const newBody = deepCloneObject(requestConfig.body);
        newOptions["url"] = env.url;
        newBody.method = "query.Balance";
        newBody["params"] = {
            address: beneficiary
        }
        let balanceRe = {}
        await RPC.returnPromise({...newOptions, ...{body: newBody}}).then(response => {
            // return obj mapping for query balance
            balanceRe = balanceHelper(response)
            return
        }).catch(err => {
            balanceRe = new Error("failed to query beneficiary account balance in parse domain: " + name + " " + err.message);
            return
        })
        if (balanceRe.name !== undefined) return Promise.reject(balanceRe)
        const obj = {
            ownerAddress: owner,
            beneficiaryAccount: beneficiary,
            beneficiaryBalance: balanceRe,
            domainName: name,
            creationHeight: creationHeight,
            lastUpdateHeight: lastUpdateHeight,
            activeFlag: activeFlag || false,
            onSaleFlag: onSaleFlag || false,
            expireHeight: expireHeight || 0,
            uri: uri || "",
            currentHeight: currentHeight
        };
        domainList.push({...obj, ...saleObj})
    }
    return Promise.resolve(domainList)
}

// parse query proposal response
function parseProposalReply(proposalStats = [], currentHeight = 0) {
    const proposalList = [];
    try {
        proposalStats.forEach((proposalStat) => {
            const {proposal, funds, votes} = proposalStat || {}
            const {proposalId, proposalType, status, outcome, headline, descr, proposer, fundingDeadline, fundingGoal, votingDeadline, passPercent} = proposal || "";
            const proposalTypeName = getKeyByValue(requestConfig.ProposalTypes, proposalType);
            const proposalStatusName = getKeyByValue(requestConfig.ProposalStatus, status);
            const proposalOutcomeName = getKeyByValue(requestConfig.ProposalOutcome, outcome);
            const fundingGoalInOLT = `${responsePriceConverter(fundingGoal, requestConfig.OLT.decimal)} ${requestConfig.OLT.currency}`;
            const fundsInOLT = `${responsePriceConverter(funds, requestConfig.OLT.decimal)} ${requestConfig.OLT.currency}`;
            const statusForUI = getStatusForUI(proposal, currentHeight);
            const obj = {
                proposal: {
                    proposalId,
                    proposalType: proposalTypeName,
                    status: proposalStatusName,
                    statusForUI,
                    outCome: proposalOutcomeName,
                    headline,
                    description: descr,
                    proposer,
                    fundingDeadline,
                    fundingGoal: fundingGoalInOLT,
                    votingDeadline,
                    passPercent
                },
                funds: fundsInOLT,
                votes,
                currentHeight
            }
            proposalList.push(obj)
        })
    } catch (e) {
        throw e
    }
    return proposalList
}

// status for UI mapping:
// 0x01, Funding In Progress:
// Status = Funding AND Current Height < Funding Deadline
//
// 0x02, Voting In Progress:
// Status = Voting
//
// 0x03, Approved:
// Status = Completed AND Outcome = Completed Yes
//
// 0x04, Rejected:
// Status = Completed AND Outcome = Completed No
//
// 0x05, Funding Failed:
// (Status = Funding AND Current Height >= Funding Deadline) || (Status = Completed AND Outcome=Insufficient Funds)
//
// 0x06, Cancelled:
// Status = Completed AND Outcome = Cancel
//
// 0x07, Expired
// Status = Completed AND Outcome = Insufficient Vote
//
// 0xEE, Unknown
function getStatusForUI(proposal, currentHeight = 0) {
    const {status, outcome, fundingDeadline} = proposal;
    let statusForUI = requestConfig.ProposalUIStatus.Unknown;
    // console.log("proposal.status: ", status);
    // console.log("proposal.outcome: ", outcome);
    // console.log("proposal.fundingDeadline: ", fundingDeadline);
    switch (status) {
        case requestConfig.ProposalStatus.Funding:
            if (currentHeight === 0) {
                statusForUI = getKeyByValue(requestConfig.ProposalUIStatus, requestConfig.ProposalUIStatus.Unknown);
            } else if (currentHeight < fundingDeadline) {
                statusForUI = getKeyByValue(requestConfig.ProposalUIStatus, requestConfig.ProposalUIStatus.FundingInProgress);
            } else {
                statusForUI = getKeyByValue(requestConfig.ProposalUIStatus, requestConfig.ProposalUIStatus.FundingFailed);
            }
            break;
        case requestConfig.ProposalStatus.Voting:
            statusForUI = getKeyByValue(requestConfig.ProposalUIStatus, requestConfig.ProposalUIStatus.VotingInProgress);
            break;
        case requestConfig.ProposalStatus.Completed:
            if (outcome === requestConfig.ProposalOutcome.CompletedYes) {
                statusForUI = getKeyByValue(requestConfig.ProposalUIStatus, requestConfig.ProposalUIStatus.Approved);
            } else if (outcome === requestConfig.ProposalOutcome.InsufficientVotes) {
                statusForUI = getKeyByValue(requestConfig.ProposalUIStatus, requestConfig.ProposalUIStatus.Expired);
            } else if (outcome === requestConfig.ProposalOutcome.CompletedNo) {
                statusForUI = getKeyByValue(requestConfig.ProposalUIStatus, requestConfig.ProposalUIStatus.Rejected);
            } else if (outcome === requestConfig.ProposalOutcome.InsufficientFunds) {
                statusForUI = getKeyByValue(requestConfig.ProposalUIStatus, requestConfig.ProposalUIStatus.FundingFailed);
            } else if (outcome === requestConfig.ProposalOutcome.Cancelled) {
                statusForUI = getKeyByValue(requestConfig.ProposalUIStatus, requestConfig.ProposalUIStatus.Cancelled);
            } else {
                statusForUI = getKeyByValue(requestConfig.ProposalUIStatus, requestConfig.ProposalUIStatus.Unknown);
            }
            break;
        default:
            statusForUI = getKeyByValue(requestConfig.ProposalUIStatus, requestConfig.ProposalUIStatus.Unknown);
    }
    return statusForUI;
}

// parse currency name which is nested inside of query domain reply structure
// pass the salePrice object alone with the current domain object which will be insert the 'currency' and 'salePrice' fields
// if salePrice is a string, default currency is OLT
function parseCurrencyName(salePrice) {
    const result = {};
    if (typeof salePrice === "string") {
        result["currency"] = "OLT";
        result["salePrice"] = responsePriceConverter(salePrice, requestConfig.OLT.decimal);
    } else {
        const {currency, amount} = salePrice || "";
        const {name, decimal} = currency || "";
        result["currency"] = name || "";
        result["salePrice"] = responsePriceConverter(amount, decimal);
    }
    return result;
}

/**
 * @description Check if OLT address is valid
 * @param addr {string} addr should be OLT address
 * @return {boolean} returns true if valid, returns false if not valid
 */
function isValidOLTAddress(addr) {
    return !(!isValidString(addr) || !addr.startsWith("0lt") || addr.length !== 43)
}

/**
 * @description Verify account address of domain based on domain extension(keyType)
 * if keyType is not given , use default keyType "OLT"
 * @param addr="" {string} address to be verify
 * @param keyTypeName="OLT" {string} key type of the address, default is "OLT"
 * @return {Promise} valid keytype returns resolve with boolean, invalid keytype returns reject with error
 */
async function isValidAccountAddress(addr = "", keyTypeName = KeyType.OLT) {
    if (!isValidString(addr)) return Promise.resolve(false);
    let addressKeyType = keyTypeName;
    if (addressKeyType === requestConfig.DomainType.BTC) {
        // TODO : update here when support new BTC payment method
        switch (addr.length) {
            case BTC_P2PK_PUBKEY_LENGTH:
                addressKeyType = KeyType.BTCP2PK;
                break;
            case BTC_P2PKH_ADDR_LENGTH:
                addressKeyType = KeyType.BTCP2PKH;
                break;
            default:
                return Promise.resolve(false)
        }
    }
    const result = await HDVault.address.verify(addr, addressKeyType).catch(error => {
        return Promise.reject(error)
    });
    return Promise.resolve(result);
}

/**
 * @description validate domainName
 * this function should run before lowerCaseDomainName function
 * @param domainName {string} domain name
 * @param configEnv {Object}
 * @param configEnv.platform {string} config file location type which contains domain suffix for domain validation
 */
async function validateDomainName(domainName, configEnv) {
    if (isEmpty(domainName) || domainName.length > 256) return Promise.reject(Error("domain name can not be empty or longer than 256 chars"));
    let domainSuffixes;
    const {platform, storeLocation} = configEnv || {};
    try {
        domainSuffixes = loadStoreByKey({
            platform,
            storeName: requestConfig.sdkConfigFileName,
            storeLocation,
            defaultData: sdkConfigDefaultData
        }, "DomainSuffix") || []
    } catch (err) {
        return Promise.reject(err)
    }
    for (let domainSuffix of domainSuffixes) {
        if (domainName.endsWith("." + domainSuffix)) {
            const userInputName = domainName.substring(0, domainName.length - domainSuffix.length - 1);
            if (userInputName.match(domainNamePattern)) return Promise.resolve(true)
            return Promise.reject(Error("domain name is invalid"))
        }
    }
    return Promise.reject(Error("domain extension is invalid"))
}

function lowerCaseDomainName(domainName) {
    if (!isEmpty(domainName)) return domainName.toLocaleLowerCase();
    return ""
}

/**
 * @description get domain extension.
 * Call this function after verify domain name
 * @param domainName {string} must be a valid domainName with extension
 * @return {string} all upper case domain extension without "."
 */
function getDomainExtension(domainName) {
    return domainName.substring(domainName.indexOf(".") + 1).toUpperCase()
}

/**
 * @description verify an BeneficiaryAccount address based on the domain extension
 * domainName must have a valid address type name as domain extension, such as xxx.btc, xxx.eth
 * ONLY allow OLT address as BeneficiaryAccount currently
 */
async function verifyBeneficiaryAccount(account, domainName) {
    // only allow OLT address as BeneficiaryAccount currently
    // const domainExtension = getDomainExtension(domainName);
    const domainExtension = requestConfig.DomainType.OLT;
    // verify address based on domain extension(like .btc, .eth)
    const verifyAccountAddrResult = await isValidAccountAddress(account, domainExtension).catch(error => {
        return Promise.reject(error)
    });
    // return different error obj based on diff address type if verification failed
    if (!verifyAccountAddrResult) {
        switch (domainExtension) {
            case requestConfig.DomainType.OLT:
                return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));
            case requestConfig.DomainType.BTC:
                if (account.length === BTC_P2PK_PUBKEY_LENGTH) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidBTCP2PKAddress));
                if (account.length === BTC_P2PKH_ADDR_LENGTH) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidBTCP2PKHAddress));
                else return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidBTCP2PKHAddress));
            case requestConfig.DomainType.ETH:
                return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidETHAddress));
            default:
                return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalDomainName));
        }
    }
    return Promise.resolve(true)
}

// Parse balance obj returned from protocol
function balanceWrap(obj) {
    const {balance, height} = obj;
    const balanceObj = requestConfig.defaultBalanceReturnObj(height);
    if (isEmpty(balance)) {
        return balanceObj;
    }
    const balanceArray = balance.split(",");
    balanceArray.forEach(balanceItem => {
        const afterTrim = balanceItem.trim();
        const cname = afterTrim.substr(afterTrim.indexOf(" ") + 1).trim();
        balanceObj[cname] = {balance: afterTrim, height: height}
    });
    return balanceObj
}

function rawTxStructure(rawTx) {
    return {rawTx: rawTx}
}

// check if input is empty, return true if obj is empty, otherwise return false
function isEmpty(obj) {
    return (typeof obj === "undefined" || obj === null || obj === "");
}

// assemble transaction data object that is going to be serialized offline
function assembleTxData(txType, txData, gasPrice, gasAdjustment) {
    const gasNeeded = calculateTxGas({txType, txData, gasAdjustment});
    return {
        type: txType,
        data: offlineSerialize.jsonObjectToBase64(txData),
        fee: {
            price: gasPrice,
            gas: gasNeeded
        },
        memo: uuid()
    }
}

function booleanArgCheckConditions(arg) {
    return typeof arg === "undefined" || typeof arg !== "boolean"
}

function domainActiveFlagChecker(active) {
    if (booleanArgCheckConditions(active)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidActiveFlag));
    return Promise.resolve(true)
}

function domainCancelSaleFlagChecker(cancelSale) {
    if (booleanArgCheckConditions(cancelSale)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidCancelSaleFlag));
    return Promise.resolve(true)
}

function domainOnSaleFlagChecker(onSale) {
    if (booleanArgCheckConditions(onSale)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidOnSaleFlag));
    return Promise.resolve(true)
}

/**
 * @description calculate tx gas
 * currently calculating based on tx type, so txData is no need to be provided
 * later, if protocol provides gas calculator, this function will send whole tx to protocol for total gas calculation
 * @param txType {number} hex number of tx type
 * @param txData {string} base64 encoded tx string
 * @param gasAdjustment {number} tx gas adjustment provider by user, has to be a non-negative int
 * if default gas is not enough, user can provide gasAdjustment which will be added on top of default value
 * @return {number} total gas of a tx
 */
function calculateTxGas({txType, txData, gasAdjustment}) {
    const txTypeName = getKeyByValue(requestConfig.TxTypes, txType);
    const defaultGas = getValueByKey(requestConfig.defaultTxGas, txTypeName);
    return defaultGas + gasAdjustment
}

// verify if env obj is valid, if valid returns valid env obj, otherwise returns error obj
async function verifyEnvParam(env) {
    const envObj = {...requestConfig.defaultEnv, ...env};
    const {url} = envObj;
    if (isValidString(url) && url.toString().match(URLPattern)) return Promise.resolve(envObj);
    else return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalURL))
}

// verify domain uri, if valid, returns true, otherwise returns false
function isValidUri(uri) {
    if (isEmpty(uri)) return false;
    return !!uri.match(domainURIPattern)
}

// verify rpc method, if valid, returns true, otherwise returns false
// this is used for any customized rpc method
function isValidMethod(method) {
    if (isEmpty(method)) return false;
    return !!method.match(methodPattern)
}

/**
 * @description load store based on platform env and storeName
 * @param configEnv
 * @param configEnv.platform {string} store platform type
 * @param configEnv.storeName {string} store name
 * @param configEnv.defaultData {Object} store default data in JSON format
 * @param [configEnv.storeLocation] {string} store path
 * @param key {string} key of the data pair
 */
function loadStoreByKey(configEnv, key) {
    const {platform, storeName, storeLocation, defaultData} = configEnv;
    if (!isItemExistInObj(storeInitFuncMapping, platform)) throw Error("No valid store platform is given");
    const storeLoadFn = getValueByKey(storeInitFuncMapping, platform);
    let store;
    try {
        store = storeLoadFn({storeName, storeLocation, defaultData})
    } catch (err) {
        throw Error("Failed to load store : " + err)
    }
    return store.get(key)
}

/**
 * @description update store on platform env and storeName
 * @description only use this endpoint to access store.set function in storeFs.js and storeBrowser.js, since empty value check is moved here to avoid circular require
 * @param configEnv
 * @param configEnv.platform {string} store platform type
 * @param configEnv.storeName {string} store name
 * @param configEnv.defaultData {Object} store default data in JSON format
 * @param [configEnv.storeLocation] {string} store physical path, only applicable when platform is app
 * @param newContentKey {string} new json data key
 * @param newContentVal {any} new json data value
 */
function updateStore(configEnv, newContentKey, newContentVal) {
    if (isEmpty(newContentKey) || isEmpty(newContentVal)) throw Error("Invalid data to write store");
    const {platform, storeName, storeLocation, defaultData} = configEnv;
    if (!isItemExistInObj(storeInitFuncMapping, platform)) throw Error("No valid store platform is given");
    const storeLoadFn = getValueByKey(storeInitFuncMapping, platform);
    let store;
    try {
        store = storeLoadFn({storeName, storeLocation, defaultData});
        store.set(newContentKey, newContentVal);
    } catch (err) {
        throw Error("Failed to update store : " + err)
    }
}

// return key based on object value
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value)
}

// return value based on object key
function getValueByKey(object, key) {
    return Object.values(object).find(value => object[key] === value)
}

// check if key is exists in given object, return true if exists, otherwise return false
function isItemExistInObj(object, key) {
    return Object.keys(object).includes(key)
}

/**
 * @description tx fee estimator
 * @param totalGas {number} total gas for a tx
 * @param gasPriceObj {Object} total gas for a tx
 * @param gasPriceObj.currency {Object} gas price currency
 * @param gasPriceObj.value {Object} gasPrice value
 */
async function txFeeEstimator(totalGas, gasPriceObj) {
    const {currency, value} = gasPriceObj;
    if (currency !== requestConfig.OLT.currency) return Promise.reject(ErrorUtil.errorWrap(requestErrors.FeeCalculationError));
    const fee = Number(value) * totalGas;
    return ErrorUtil.responseWrap({
        value: responsePriceConverter(fee.toString(), requestConfig.OLT.decimal),
        currency: requestConfig.OLT.currency
    })
}

// get currency details based on given currency name
async function getCurrency(currencyName) {
    const c = requestConfig.Currencies[currencyName];
    if (typeof c === "undefined") return Promise.reject(ErrorUtil.errorWrap(requestErrors.CurrencyNotRegistered));
    return Promise.resolve(c)
}

// deep object clone
function deepCloneObject(obj) {
    return cloneDeep(obj)
}

async function hash(data) {
    if (isEmpty(data)) return Promise.resolve("");
    try {
        const hash = crypto.createHash('sha256');
        hash.update(data);
        return Promise.resolve(hash.digest('hex'))
    } catch (err) {
        return Promise.reject(err)
    }
}

module.exports = {
    isValidOLTAddress,
    isValidString,
    lowerCaseDomainName,
    validateDomainName,
    requestPriceConverter,
    responsePriceConverter,
    parseDomainReply,
    parseProposalReply,
    rawTxStructure,
    isEmpty,
    assembleTxData,
    balanceWrap,
    balanceHelper,
    getDomainExtension,
    isValidAccountAddress,
    verifyBeneficiaryAccount,
    domainActiveFlagChecker,
    domainCancelSaleFlagChecker,
    domainOnSaleFlagChecker,
    verifyEnvParam,
    isValidUri,
    calculateTxGas,
    txFeeEstimator,
    isValidTrackerName,
    getCurrency,
    updateStore,
    loadStoreByKey,
    getKeyByValue,
    deepCloneObject,
    getStatusForUI,
    hash,
    isValidMethod
};
