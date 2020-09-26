const requestConfig = require("./requestConfig");
const {defaultEnv} = requestConfig;
const request = require('./requestGenerator');
const util = require("./util");
const offlineSerialize = require('./offlineSerialization');
const {ErrorType, ErrorUtil} = require("middle_utility").TierError;
const {requestErrors} = ErrorType;

console.warn("Warning: requestOffline module will be renamed to 'ONS' in future version, please use sdk.ONS to access all domain txs");

/**
 * @description Offline rawTx generator of creating domain
 * @param parameters {Object} object of parameters
 * @param parameters.ownerAddress {string} domain owner address
 * @param parameters.beneficiaryAccount {string} domain associated address
 * @param parameters.domainName {string} domain name
 * @param parameters.price {Object} domain creation price object
 * @param parameters.price.currency {string} name of the currency that used to create domain
 * @param parameters.price.value {string} amount of currency that used to create domain
 * @param [parameters.uri] {string} domain uri
 * @param [parameters.gasAdjustment] {number} tx gas adjustment, non-negative int, if not provided, default value will be 0
 * @param [env] {Object} environment parameters object
 * @param env.url {string} environment url (default is Kainos)
 * @param env.storeConfig {Object} store config
 * @param env.storeConfig.platform {string} store type. "electron" or "browser" (default is electron)
 * @param env.storeConfig.storeLocation {string} store location path (default is __dirname)
 * @return {Promise<response|error>} Promise.reject: error object , Promise.resolve: response object has rawTx with tx fee estimation
 */
async function domainCreateTxOffline({ownerAddress, beneficiaryAccount, domainName, price, uri, gasAdjustment = 0}, env = defaultEnv) {
    if (!util.isValidOLTAddress(ownerAddress)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));
    const checkPriceValueResult = util.requestPriceConverter(price.value, requestConfig.OLT.decimal);
    if (!checkPriceValueResult) return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalPrice));
    price.value = checkPriceValueResult;

    let gasPrice;
    try {
        const result = await request.queryGasPrice(env);
        gasPrice = result.response
    } catch (err) {
        return Promise.reject(err)
    }

    // check if domain name is valid
    const {storeConfig} = env;
    await util.validateDomainName(domainName, storeConfig).catch(err => {
        const returnErr = {
            code: requestErrors.IllegalDomainName.code,
            message: requestErrors.IllegalDomainName.message,
            detail: `${err}`
        };
        return Promise.reject(ErrorUtil.errorWrap(returnErr))
    });

    // check if beneficiaryAccount is valid
    await util.verifyBeneficiaryAccount(beneficiaryAccount, domainName).catch(error => {
        return Promise.reject(error)
    });

    // check uri if provided
    if (!util.isEmpty(uri) && !util.isValidUri(uri)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidURI));

    // check gasAdjustment if provided
    if (!Number.isInteger(gasAdjustment) || gasAdjustment < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidGasAdjustment));

    const tx_dataObj = {
        owner: ownerAddress,
        account: beneficiaryAccount,
        name: util.lowerCaseDomainName(domainName),
        buyingPrice: price,
        uri: uri
    };

    const assembledTx = util.assembleTxData(requestConfig.TxTypes.DOMAIN_CREATE, tx_dataObj, gasPrice, gasAdjustment);
    const {gas} = assembledTx.fee;
    const feeEstimationResult = await util.txFeeEstimator(gas, gasPrice).catch(err => {
        return Promise.reject(err)
    });
    return Promise.resolve(ErrorUtil.responseWrap({...util.rawTxStructure(offlineSerialize.jsonObjectToBase64(assembledTx)), ...{feeEstimation: feeEstimationResult.response}}))
}

/**
 * @description Offline rawTx generator of updating domain
 * @param parameters {Object} object of parameters
 * @param parameters.ownerAddress {string} domain owner address
 * @param parameters.beneficiaryAccount {string} updated domain associated account address
 * @param parameters.domainName {string} domain name
 * @param parameters.active {boolean} updated domain active flag
 * @param [parameters.uri] {string} domain uri
 * @param [parameters.gasAdjustment] {number} tx gas adjustment, non-negative int, if not provided, default value will be 0
 * @param [env] {Object} environment parameters object
 * @param env.url {string} environment url (default is Kainos)
 * @param env.storeConfig {Object} store config
 * @param env.storeConfig.platform {string} store type. "electron" or "browser" (default is electron)
 * @param env.storeConfig.storeLocation {string} store location path (default is __dirname)
 * @return {Promise<response|error>} Promise.reject: error object , Promise.resolve: response object has rawTx with tx fee estimation
 */
async function domainUpdateTxOffline({ownerAddress, beneficiaryAccount, domainName, active, uri, gasAdjustment = 0}, env = defaultEnv) {
    if (!util.isValidOLTAddress(ownerAddress)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));

    await util.domainActiveFlagChecker(active).catch(error => {
        return Promise.reject(error)
    });

    let gasPrice;
    try {
        const result = await request.queryGasPrice(env);
        gasPrice = result.response
    } catch (err) {
        return Promise.reject(err)
    }

    // check if domain name is valid
    const {storeConfig} = env;
    await util.validateDomainName(domainName, storeConfig).catch(err => {
        const returnErr = {
            code: requestErrors.IllegalDomainName.code,
            message: requestErrors.IllegalDomainName.message,
            detail: `${err}`
        };
        return Promise.reject(ErrorUtil.errorWrap(returnErr))
    });

    // check if account is valid
    await util.verifyBeneficiaryAccount(beneficiaryAccount, domainName).catch(error => {
        return Promise.reject(error)
    });

    // check uri if provided
    if (!util.isEmpty(uri) && !util.isValidUri(uri)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidURI));

    // check gasAdjustment if provided
    if (!Number.isInteger(gasAdjustment) || gasAdjustment < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidGasAdjustment));

    const tx_dataObj = {
        owner: ownerAddress,
        beneficiary: beneficiaryAccount,
        name: util.lowerCaseDomainName(domainName),
        active: active,
        uri: uri
    };

    const assembledTx = util.assembleTxData(requestConfig.TxTypes.DOMAIN_UPDATE, tx_dataObj, gasPrice, gasAdjustment);
    const {gas} = assembledTx.fee;
    const feeEstimationResult = await util.txFeeEstimator(gas, gasPrice).catch(err => {
        return Promise.reject(err)
    });
    return Promise.resolve(ErrorUtil.responseWrap({...util.rawTxStructure(offlineSerialize.jsonObjectToBase64(assembledTx)), ...{feeEstimation: feeEstimationResult.response}}))
}

/**
 * @description Offline rawTx generator of renewing domain
 * Only parent domain can be renewed
 * @param parameters {Object} object of parameters
 * @param parameters.ownerAddress {string} domain owner address
 * @param parameters.domainName {string} domain name
 * @param parameters.price {Object} domain creation price object
 * @param parameters.price.currency {string} name of the currency that used to create domain
 * @param parameters.price.value {string} amount of currency that used to create domain
 * @param [parameters.gasAdjustment] {number} tx gas adjustment, non-negative int, if not provided, default value will be 0
 * @param [env] {Object} environment parameters object
 * @param env.url {string} environment url (default is Kainos)
 * @param env.storeConfig {Object} store config
 * @param env.storeConfig.platform {string} store type. "electron" or "browser" (default is electron)
 * @param env.storeConfig.storeLocation {string} store location path (default is __dirname)
 * @return {Promise<response|error>} Promise.reject: error object , Promise.resolve: response object has rawTx with tx fee estimation
 */
async function domainRenewTxOffline({ownerAddress, domainName, price, gasAdjustment = 0}, env = defaultEnv) {
    if (!util.isValidOLTAddress(ownerAddress)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));
    const checkPriceValueResult = util.requestPriceConverter(price.value, requestConfig.OLT.decimal);
    if (!checkPriceValueResult) return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalPrice));
    price.value = checkPriceValueResult;

    let gasPrice;
    try {
        const result = await request.queryGasPrice(env);
        gasPrice = result.response
    } catch (err) {
        return Promise.reject(err)
    }

    // check if domain name is valid
    const {storeConfig} = env;
    await util.validateDomainName(domainName, storeConfig).catch(err => {
        const returnErr = {
            code: requestErrors.IllegalDomainName.code,
            message: requestErrors.IllegalDomainName.message,
            detail: `${err}`
        };
        return Promise.reject(ErrorUtil.errorWrap(returnErr))
    });

    // check gasAdjustment if provided
    if (!Number.isInteger(gasAdjustment) || gasAdjustment < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidGasAdjustment));

    const tx_dataObj = {
        owner: ownerAddress,
        name: util.lowerCaseDomainName(domainName),
        buyingPrice: price,
    };

    const assembledTx = util.assembleTxData(requestConfig.TxTypes.DOMAIN_RENEW, tx_dataObj, gasPrice, gasAdjustment);
    const {gas} = assembledTx.fee;
    const feeEstimationResult = await util.txFeeEstimator(gas, gasPrice).catch(err => {
        return Promise.reject(err)
    });
    return Promise.resolve(ErrorUtil.responseWrap({...util.rawTxStructure(offlineSerialize.jsonObjectToBase64(assembledTx)), ...{feeEstimation: feeEstimationResult.response}}))
}

/**
 * @description Offline rawTx generator of updating a domain onSale flag
 * Only parent domain can be put on sale
 * @param parameters {Object} object of parameters
 * @param parameters.domainName {string} domain name
 * @param parameters.ownerAddress {string} domain owner address
 * @param parameters.price {Object} price for selling a domain
 * @param parameters.price.currency {string} name of the currency that put domain on sale
 * @param parameters.price.value {string} amount of currency that put domain on sale
 * @param parameters.cancelSale {boolean} updated domain onSale flag
 * @param [parameters.gasAdjustment] {number} tx gas adjustment, non-negative int, if not provided, default value will be 0
 * @param [env] {Object} environment parameters object
 * @param env.url {string} environment url (default is Kainos)
 * @param env.storeConfig {Object} store config
 * @param env.storeConfig.platform {string} store type. "electron" or "browser" (default is electron)
 * @param env.storeConfig.storeLocation {string} store location path (default is __dirname)
 * @return {Promise<response|error>} Promise.reject: error object , Promise.resolve: response object has rawTx with tx fee estimation
 */
async function domainSaleTxOffline({domainName, ownerAddress, price, cancelSale, gasAdjustment = 0}, env = defaultEnv) {
    if (!util.isValidOLTAddress(ownerAddress)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));

    await util.domainCancelSaleFlagChecker(cancelSale).catch(error => {
        return Promise.reject(error)
    });

    // price convert
    const checkPriceValueResult = util.requestPriceConverter(price.value, requestConfig.OLT.decimal);
    if (!checkPriceValueResult) return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalPrice));
    price.value = checkPriceValueResult;

    let gasPrice;
    try {
        const result = await request.queryGasPrice(env);
        gasPrice = result.response
    } catch (err) {
        return Promise.reject(err)
    }

    // check if domain name is valid
    const {storeConfig} = env;
    await util.validateDomainName(domainName, storeConfig).catch(err => {
        const returnErr = {
            code: requestErrors.IllegalDomainName.code,
            message: requestErrors.IllegalDomainName.message,
            detail: `${err}`
        };
        return Promise.reject(ErrorUtil.errorWrap(returnErr))
    });

    // check gasAdjustment if provided
    if (!Number.isInteger(gasAdjustment) || gasAdjustment < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidGasAdjustment));

    const tx_dataObj = {
        name: util.lowerCaseDomainName(domainName),
        ownerAddress: ownerAddress,
        price: price,
        cancelSale: cancelSale
    };

    const assembledTx = util.assembleTxData(requestConfig.TxTypes.DOMAIN_SELL, tx_dataObj, gasPrice, gasAdjustment);
    const {gas} = assembledTx.fee;
    const feeEstimationResult = await util.txFeeEstimator(gas, gasPrice).catch(err => {
        return Promise.reject(err)
    });
    return Promise.resolve(ErrorUtil.responseWrap({...util.rawTxStructure(offlineSerialize.jsonObjectToBase64(assembledTx)), ...{feeEstimation: feeEstimationResult.response}}))
}

/**
 * @description Offline rawTx generator of buying a domain
 * Only parent domain can be purchased
 * @param parameters {Object} object of parameters
 * @param parameters.domainName {string} domain name
 * @param parameters.buyerAddress {string} buyer's address
 * @param parameters.beneficiaryAccount {string} new domain associated account address
 * @param parameters.offerAmount {Object} purchase offer object
 * @param parameters.offerAmount.currency {string} name of the currency that used to buy domain
 * @param parameters.offerAmount.value {string} amount of currency that used to buy domain
 * @param [parameters.gasAdjustment] {number} tx gas adjustment, non-negative int, if not provided, default value will be 0
 * @param [env] {Object} environment parameters object
 * @param env.url {string} environment url (default is Kainos)
 * @param env.storeConfig {Object} store config
 * @param env.storeConfig.platform {string} store type. "electron" or "browser" (default is electron)
 * @param env.storeConfig.storeLocation {string} store location path (default is __dirname)
 * @return {Promise<response|error>} Promise.reject: error object , Promise.resolve: response object has rawTx with tx fee estimation
 */
async function domainPurchaseTxOffline({domainName, buyerAddress, beneficiaryAccount, offerAmount, gasAdjustment = 0}, env = defaultEnv) {
    if (!util.isValidOLTAddress(buyerAddress)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));
    // offer amount convert
    const checkOfferValueResult = util.requestPriceConverter(offerAmount.value, requestConfig.OLT.decimal);
    if (!checkOfferValueResult) return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalOfferAmount));
    offerAmount.value = checkOfferValueResult;

    let gasPrice;
    try {
        const result = await request.queryGasPrice(env);
        gasPrice = result.response
    } catch (err) {
        return Promise.reject(err)
    }

    // check if domain name is valid
    const {storeConfig} = env;
    await util.validateDomainName(domainName, storeConfig).catch(err => {
        const returnErr = {
            code: requestErrors.IllegalDomainName.code,
            message: requestErrors.IllegalDomainName.message,
            detail: `${err}`
        };
        return Promise.reject(ErrorUtil.errorWrap(returnErr))
    });

    // check if account is valid
    await util.verifyBeneficiaryAccount(beneficiaryAccount, domainName).catch(error => {
        return Promise.reject(error)
    });

    // check gasAdjustment if provided
    if (!Number.isInteger(gasAdjustment) || gasAdjustment < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidGasAdjustment));

    const tx_dataObj = {
        name: util.lowerCaseDomainName(domainName),
        buyer: buyerAddress,
        account: beneficiaryAccount,
        offering: offerAmount
    };

    const assembledTx = util.assembleTxData(requestConfig.TxTypes.DOMAIN_PURCHASE, tx_dataObj, gasPrice, gasAdjustment);
    const {gas} = assembledTx.fee;
    const feeEstimationResult = await util.txFeeEstimator(gas, gasPrice).catch(err => {
        return Promise.reject(err)
    });
    return Promise.resolve(ErrorUtil.responseWrap({...util.rawTxStructure(offlineSerialize.jsonObjectToBase64(assembledTx)), ...{feeEstimation: feeEstimationResult.response}}))
}

/**
 * @description Offline RawTx generator of Sending registered currency to OLT address
 * @param parameters {Object} object of parameters
 * @param parameters.fromAddr {string} sender address
 * @param parameters.to {string} recipient address
 * @param parameters.amount {Object} sending amount object
 * @param parameters.amount.currency {string} sending currency name
 * @param parameters.amount.value {string} sending amount
 * @param [parameters.gasAdjustment] {number} tx gas adjustment, non-negative int, if not provided, default value will be 0
 * @param [env] {Object} environment parameters object
 * @param env.url {string} environment url (default is Kainos)
 * @param env.storeConfig {Object} store config
 * @param env.storeConfig.platform {string} store type. "electron" or "browser" (default is electron)
 * @param env.storeConfig.storeLocation {string} store location path (default is __dirname)
 * @return {Promise<response|error>} Promise.reject: error object , Promise.resolve: response object has rawTx with tx fee estimation
 */
async function sendToAddressTxOffline({fromAddr, to, amount, gasAdjustment = 0}, env = defaultEnv) {
    // check from and to input
    if (!util.isValidOLTAddress(fromAddr) || !util.isValidOLTAddress(to)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));
    // amount convert
    const sendingCurrency = await util.getCurrency(amount.currency).catch(err => {
        return Promise.reject(err)
    });
    const checkAmountValueResult = util.requestPriceConverter(amount.value, sendingCurrency.decimal);
    if (!checkAmountValueResult) return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalAmount));
    amount.value = checkAmountValueResult;

    let gasPrice;
    try {
        const result = await request.queryGasPrice(env);
        gasPrice = result.response
    } catch (err) {
        return Promise.reject(err)
    }

    // check gasAdjustment if provided
    if (!Number.isInteger(gasAdjustment) || gasAdjustment < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidGasAdjustment));

    const tx_dataObj = {
        from: fromAddr,
        to: to,
        amount: amount
    };

    const assembledTx = util.assembleTxData(requestConfig.TxTypes.SEND, tx_dataObj, gasPrice, gasAdjustment);
    const {gas} = assembledTx.fee;
    const feeEstimationResult = await util.txFeeEstimator(gas, gasPrice).catch(err => {
        return Promise.reject(err)
    });
    return Promise.resolve(ErrorUtil.responseWrap({...util.rawTxStructure(offlineSerialize.jsonObjectToBase64(assembledTx)), ...{feeEstimation: feeEstimationResult.response}}))
}

/**
 * @description Offline rawTx generator of sending currency to a domain
 * @param parameters {Object} object of parameters
 * @param parameters.domainName {string} domain name
 * @param parameters.fromAccount {string} sender address
 * @param parameters.amount {Object} sending amount object
 * @param parameters.amount.currency {string} name of the currency that send
 * @param parameters.amount.value {string} amount of currency that send
 * @param [parameters.gasAdjustment] {number} tx gas adjustment, non-negative int, if not provided, default value will be 0
 * @param [env] {Object} environment parameters object
 * @param env.url {string} environment url (default is Kainos)
 * @param env.storeConfig {Object} store config
 * @param env.storeConfig.platform {string} store type. "electron" or "browser" (default is electron)
 * @param env.storeConfig.storeLocation {string} store location path (default is __dirname)
 * @return {Promise<response|error>} Promise.reject: error object , Promise.resolve: response object has rawTx with tx fee estimation
 */
async function sendToDomainTxOffline({domainName, fromAccount, amount, gasAdjustment = 0}, env = defaultEnv) {
    if (!util.isValidOLTAddress(fromAccount)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));
    // amount convert
    const sendingCurrency = await util.getCurrency(amount.currency).catch(err => {
        return Promise.reject(err)
    });
    const checkAmountValueResult = util.requestPriceConverter(amount.value, sendingCurrency.decimal);
    if (!checkAmountValueResult) return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalAmount));
    amount.value = checkAmountValueResult;

    let gasPrice;
    try {
        const result = await request.queryGasPrice(env);
        gasPrice = result.response
    } catch (err) {
        return Promise.reject(err)
    }

    // check if domain name is valid
    const {storeConfig} = env;
    await util.validateDomainName(domainName, storeConfig).catch(err => {
        const returnErr = {
            code: requestErrors.IllegalDomainName.code,
            message: requestErrors.IllegalDomainName.message,
            detail: `${err}`
        };
        return Promise.reject(ErrorUtil.errorWrap(returnErr))
    });

    // check gasAdjustment if provided
    if (!Number.isInteger(gasAdjustment) || gasAdjustment < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidGasAdjustment));

    const tx_dataObj = {
        name: util.lowerCaseDomainName(domainName),
        from: fromAccount,
        amount: amount
    };

    const assembledTx = util.assembleTxData(requestConfig.TxTypes.DOMAIN_SEND, tx_dataObj, gasPrice, gasAdjustment);
    const {gas} = assembledTx.fee;
    const feeEstimationResult = await util.txFeeEstimator(gas, gasPrice).catch(err => {
        return Promise.reject(err)
    });
    return Promise.resolve(ErrorUtil.responseWrap({...util.rawTxStructure(offlineSerialize.jsonObjectToBase64(assembledTx)), ...{feeEstimation: feeEstimationResult.response}}))
}

/**
 * @description Offline rawTx generator of deleting subdomains of given domain
 * @param parameters {Object} object of parameters
 * @param parameters.domainName {string} domain name
 * @param parameters.ownerAddress {string} domain owner address
 * @param [parameters.gasAdjustment] {number} tx gas adjustment, non-negative int, if not provided, default value will be 0
 * @param [env] {Object} environment parameters object
 * @param env.url {string} environment url (default is Kainos)
 * @param env.storeConfig {Object} store config
 * @param env.storeConfig.platform {string} store type. "electron" or "browser" (default is electron)
 * @param env.storeConfig.storeLocation {string} store location path (default is __dirname)
 * @return {Promise<response|error>} Promise.reject: error object , Promise.resolve: response object has rawTx with tx fee estimation
 */
async function domainDeleteSubTxOffline({domainName, ownerAddress, gasAdjustment = 0}, env = defaultEnv) {
    if (!util.isValidOLTAddress(ownerAddress)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));

    let gasPrice;
    try {
        const result = await request.queryGasPrice(env);
        gasPrice = result.response
    } catch (err) {
        return Promise.reject(err)
    }

    // check if domain name is valid
    const {storeConfig} = env;
    await util.validateDomainName(domainName, storeConfig).catch(err => {
        const returnErr = {
            code: requestErrors.IllegalDomainName.code,
            message: requestErrors.IllegalDomainName.message,
            detail: `${err}`
        };
        return Promise.reject(ErrorUtil.errorWrap(returnErr))
    });

    // check gasAdjustment if provided
    if (!Number.isInteger(gasAdjustment) || gasAdjustment < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidGasAdjustment));

    const tx_dataObj = {
        owner: ownerAddress,
        name: util.lowerCaseDomainName(domainName)
    };

    const assembledTx = util.assembleTxData(requestConfig.TxTypes.DOMAIN_DELETE_SUB, tx_dataObj, gasPrice, gasAdjustment);
    const {gas} = assembledTx.fee;
    const feeEstimationResult = await util.txFeeEstimator(gas, gasPrice).catch(err => {
        return Promise.reject(err)
    });
    return Promise.resolve(ErrorUtil.responseWrap({...util.rawTxStructure(offlineSerialize.jsonObjectToBase64(assembledTx)), ...{feeEstimation: feeEstimationResult.response}}))
}

module.exports = {
    domainCreateTxOffline,
    domainUpdateTxOffline,
    domainRenewTxOffline,
    domainSaleTxOffline,
    domainPurchaseTxOffline,
    sendToAddressTxOffline,
    sendToDomainTxOffline,
    domainDeleteSubTxOffline
};
