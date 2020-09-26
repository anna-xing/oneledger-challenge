const faucet = require("./faucet");
const ERRORS = require("./cmdErrors").cmdErrors;
const defaultFaucetUrl = require("./config").defaultEnv;
const util = require("./util");
const URLPattern = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})\/jsonrpc/;

/**
 * @description reqeust OLT in terminal
 * process.argv[0] : nodeDir(not used)
 * process.argv[1] : commondPath(not used)
 * process.argv[2] : address(required)
 * process.argv[3] : amountValue(required, between 1 and 10000)
 * process.argv[4] : url(optional, default is chronos)
 * @return {boolean}
 */
function requestOLT() {
    const argvLength = process.argv.length;
    if (argvLength < 4 || argvLength > 5) {
        console.error(ERRORS.IllegalArgvsNumberCMD);
        return false
    }
    const [nodeDir, commondPath, address, amountValue, url] = process.argv;
    if (!util.isValidOLTAddress(address)) {
        console.error(ERRORS.IllegalAddressCMD);
        return false
    }
    if (isNaN(amountValue)) {
        console.error(ERRORS.IllegalAmountCMD);
        return false
    }
    let amount = parseInt(amountValue, 10);
    if (amount <= 0 || amount > 10000) {
        console.error(ERRORS.IllegalAmountUsingDefaultCMD);
        return false
    }
    const requestOLTObj = {
        address: address,
        amount,
        url: defaultFaucetUrl.url
    };

    if (argvLength === 5 && util.isValidString(url)) {
        if (url.toString().match(URLPattern)) {
            requestOLTObj["url"] = url
        } else {
            console.error(ERRORS.IllegalURLCMD);
            return false
        }
    }

    faucet.requestOLT(requestOLTObj).then(res => {
        if (res.ok) {
            console.log("Success: please check balance");
        } else {
            console.error("Error:", res);
        }
    }).catch(err => {
        console.error("Error:", err);
    });
}

module.exports = {
    requestOLT
};
