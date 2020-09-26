const requestSender = require("./requestSender");
const {defaultUrl, registeredCurrencies} = require("./config");
const util = require("./util");
const {ErrorType, errorHandler, ErrorUtil} = require("middle_utility").TierError;
const {requestErrors} = ErrorType;

const URLPattern = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

const options = {
    method: "GET",
    timeout: 5000,
    url: ""
};

/**
 * @description Query account info
 * @param address {string} account address
 * @param [env] {Object} environment parameters object (optional, default is Chronos)
 * @param env.url {string} environment url
 * @return {Promise.<response|error>} Promise.reject: error object , Promise.resolve: response object has account address and currency balance
 */
async function queryAccountInfo(address, env = defaultUrl) {
    if (!util.isValidOLTAddress(address)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));
    const {url} = {...defaultUrl, ...env};
    if (!util.isValidString(url) || !url.toString().match(URLPattern)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalURL));
    const baseURL = url + "/accounts/";
    options.url = baseURL + address;
    return requestSender.returnPromise(options).then(resolve => {
        return Promise.resolve(ErrorUtil.responseWrap(JSON.parse(resolve)))
    }, reject => {
        return errorHandler(ErrorUtil.errorWrap(reject))
    });
}

/**
 * @description Query txs history of account
 * @param params {object}
 * @param params.address {string} account address
 * @param params.currency {string} currency name to filter
 * @param params.page {number} page number (starting from 0), default is 0 if not provided
 * @param params.pageSize {number} page size
 * @param [env] {Object} environment parameters object (default is Chronos)
 * @param env.url {string} environment url
 * @return {Promise.<response|error>} Promise.reject: error object , Promise.resolve: response object has an array that contains tx history
 */
async function queryAccountTxs({address, currency, page, pageSize}, env = defaultUrl) {
    if (util.isEmpty(address) || !util.isValidOLTAddress(address)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));
    const {url} = {...defaultUrl, ...env};
    if (!util.isValidString(url) || !url.toString().match(URLPattern)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalURL));

    const baseURL = new URL(url);
    baseURL.pathname = `/accounts/${address}/txs`;

    if (!util.isEmpty(page) && !util.isNonNegativeInteger(page)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidPageNumber));
    if (!util.isEmpty(page) && util.isNonNegativeInteger(page)) baseURL.searchParams.append("page", page);

    if (!util.isEmpty(pageSize) && !util.isNonNegativeInteger(pageSize)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidPageSize));
    if (!util.isEmpty(pageSize) && util.isNonNegativeInteger(pageSize)) baseURL.searchParams.append("pagesize", pageSize);

    if (!util.isEmpty(currency) && !registeredCurrencies.includes(currency.toUpperCase())) return Promise.reject(ErrorUtil.errorWrap(requestErrors.CurrencyNotRegistered));
    if (!util.isEmpty(currency) && registeredCurrencies.includes(currency.toUpperCase())) baseURL.searchParams.append("currency", currency.toLowerCase());

    options.url = baseURL.toString();

    return requestSender.returnPromise(options).then(resolve => {
        const jsonResolve = JSON.parse(resolve);
        // console.log("original txs : ", jsonResolve);
        return util.parseAccountTxsResult(jsonResolve).then(txArray => {
            // tx value mapping
            const txValueTxArray = util.txValueMapping(txArray, address);
            // tx code mapping
            const typeCodeTxArray = util.txTypeCodeMapping(txValueTxArray, address);
            // ONS tx recipient parse （domain name）
            const finalTxArray = util.parseONSDomainName(typeCodeTxArray);
            return Promise.resolve(ErrorUtil.responseWrap(util.returnTotalPageStructure({txs: finalTxArray}, jsonResolve.totalPage)))
        }).catch(err => {
            return Promise.reject(err)
        });
    }, reject => {
        return errorHandler(ErrorUtil.errorWrap(reject))
    });
}

module.exports = {
    queryAccountInfo,
    queryAccountTxs
};
