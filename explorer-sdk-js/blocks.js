const requestSender = require("./requestSender");
const {defaultUrl} = require("./config");
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
 * @description Query block info with a blockHeight argv or all blocks based on chainID
 * @param params {Object}
 * @param params.blockHeight {Number} block height number.
 * If blockHeightArgv is not given, it will return the latest 20 blocks.
 * If 0 is given, it will return the latest block.
 * If a valid positive integer is given, it will return the block at that height if block exists.
 * @param [params.chainID] {Number} chainID.
 * If chainID is not given, it will use current chainID in database as default
 * @param [env] {Object} environment parameters object (default is Kainos)
 * @param env.url {string} environment url
 * @return {Promise<response|error>} Promise.reject: error object , Promise.resolve: response object has block info
 */
async function queryBlocks({blockHeight, chainID = ""}, env = defaultUrl) {
    const {url} = {...defaultUrl, ...env};
    if (!util.isValidString(url) || !url.toString().match(URLPattern)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalURL));
    const baseURL = url + "/blocks";
    if (typeof blockHeight !== "undefined") {
        if (!util.isInteger(blockHeight)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidBlockHeight));
        else options.url = baseURL + "/" + blockHeight;
    } else {
        options.url = baseURL;
    }

    options.url = util.urlChainIDHepler(options.url, chainID);

    return requestSender.returnPromise(options).then(resolve => {
        return Promise.resolve(ErrorUtil.responseWrap(JSON.parse(resolve)))
    }, reject => {
        return errorHandler(ErrorUtil.errorWrap(reject))
    })
}

/**
 * @description Query blocks info with a beforeHeight argv or result limit number
 * @param params {Object}
 * @param params.beforeHeight {Number} the height of the last block you want to query (exclusive)
 * @param params.limit {Number} number of result, max 20.
 * Please note that beforeHeight and limit can not be undefined together.
 * @param [params.chainID] {string} chainID.
 * If chainID is not given, it will use current chainID in database as default
 * @param [env] {Object} environment parameters object (default is Kainos)
 * @param env.url {string} environment url
 * @return {Promise<response|error>} Promise.reject: error object , Promise.resolve: response object has block info and next page url
 */
async function queryBlocksBeforeHeight({beforeHeight, limit, chainID = ""}, env = defaultUrl) {
    if (util.isEmpty(beforeHeight) && util.isEmpty(limit)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidArgument));
    let blockHeightSuffix = "";
    if (!util.isEmpty(beforeHeight)) {
        if (!util.isValidBlockHeight(beforeHeight)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidBlockHeight));
        else blockHeightSuffix = "beforeHeight=" + beforeHeight;
    }

    let limitSuffix = "";
    if (!util.isEmpty(limit)) {
        if (!util.isValidResultLimitNum(limit)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidResultLimit));
        else limitSuffix = "limit=" + limit;
    }

    const {url} = {...defaultUrl, ...env};
    if (!util.isValidString(url) || !url.toString().match(URLPattern)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalURL));

    const baseURL = url + "/blocks?";
    if (!util.isEmpty(blockHeightSuffix) && !util.isEmpty(limitSuffix)) {
        options.url = baseURL + blockHeightSuffix + "&" + limitSuffix;
    } else if (!util.isEmpty(blockHeightSuffix)) {
        options.url = baseURL + blockHeightSuffix;
    } else {
        options.url = baseURL + limitSuffix;
    }

    options.url = util.urlChainIDHepler(options.url, chainID);

    return requestSender.returnPromise(options).then(resolve => {
        return Promise.resolve(ErrorUtil.responseWrap(JSON.parse(resolve)))
    }, reject => {
        return errorHandler(ErrorUtil.errorWrap(reject))
    })
}

module.exports = {
    queryBlocks,
    queryBlocksBeforeHeight
};
