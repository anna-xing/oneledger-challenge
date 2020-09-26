const faucet = require("./faucet");
const {ErrorType, errorHandler, ErrorUtil} = require("middle_utility").TierError;
const ERRORS = ErrorType.requestErrors;
const util = require("./util");
const URLPattern = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})\/jsonrpc/;

const defaultFaucetUrl = require("./config").defaultEnv;

/**
 * @description request OLT
 * @param address {string} address to get OLT fund
 * @param amount {number} request amount max 10000 (optional, default is 10000 OLT)
 * @param env {Object} environment parameters object (optional, default is Chronos)
 * @param env.url {string} environment url
 * @return {Promise<response|error>}
 */
async function requestOLT(address, amount = 500000, env = defaultFaucetUrl) {
    if (!util.isValidString(address)) return Promise.reject(ErrorUtil.errorWrap(ERRORS.EmptyAddress));
    if (!util.isValidOLTAddress(address)) return Promise.reject(ErrorUtil.errorWrap(ERRORS.IllegalAddress));
    if (!util.isPositiveInteger(amount)) return Promise.reject(ErrorUtil.errorWrap(ERRORS.IllegalAmount));

    const requestOLTObj = {
        address,
        amount
    };

    const envObj = {...defaultFaucetUrl, ...env};
    const {url} = envObj;
    if (util.isValidString(url) && url.toString().match(URLPattern)) requestOLTObj["url"] = url;
    else return Promise.reject(ErrorUtil.errorWrap(ERRORS.IllegalURL));

    let result;
    try {
        result = await faucet.requestOLT(requestOLTObj)
    } catch (err) {
        return errorHandler(ErrorUtil.errorWrap(err))
    }
    if (!result.ok) return Promise.reject(ERRORS.RequestFailed);
    return Promise.resolve(ErrorUtil.responseWrap({result: true, message: "Success: please check balance"}))
}

module.exports = {
    requestOLT
};
