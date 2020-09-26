const config = require("../config");

// automatically load all error code defined in errorType file
autoLoadErrArray = (errObj) => {
    const resultErrArray = [];
    Object.keys(errObj).forEach((errName) => {
        resultErrArray.push(errObj[errName].code)
    });
    return resultErrArray
};

// parse backend error code
// if there is RPC code and backend error code:
// return code as backend error code, detail as RPC code + backend error code + backend error message, message as backend error message
// if there is only RPC code:
// return code as RPC code, detail as RPC code + backend error message, message as ""
backendErrCodeRefactor = (code, originalMessage) => {
    const backendErrCode = originalMessage.slice(0, originalMessage.indexOf(":"));
    if (backendErrCode.match(config.backendErrCodePattern)) {
        const detail = code + "_" + backendErrCode + " : " + originalMessage.slice(originalMessage.indexOf(":") + 1).trim();
        const message = originalMessage.slice(originalMessage.indexOf(":") + 1).trim();
        return {code: -parseInt(backendErrCode), message, detail}
    }
    return {code, message: "", detail: code + " : " + originalMessage}
};

// return error structure to UI
errorWrap = (err) => {
    return {error: err}
};

// return response structure to UI
responseWrap = (response) => {
    return {response: response}
};

module.exports = {
    autoLoadErrArray,
    backendErrCodeRefactor,
    errorWrap,
    responseWrap
};