// all errors in the section below will only show up in terminal
// so the error codes does not affect the error code mapping and error handler in middle_utility
const cmdErrors = {
    IllegalArgvsNumberCMD: {code: "-00001", message: "Invalid argv number to request OLT"},
    IllegalAddressCMD: {code: "-00002", message: "Invalid address to request OLT, valid address starts with 0lt"},
    RequestFailedCMD: {code: "-00003", message: "Request OLT Failed, please using same version of fullnode and faucet"},
    RPCFailedCMD: {code: "-00004", message: "Failed to send request to faucet server, please check request url"},
    IllegalAmountCMD: {code: "-00005", message: "Invalid request amount"},
    IllegalAmountUsingDefaultCMD: {
        code: "-00006",
        message: "request amount should be between 1 to 10000, using default amount 10000"
    },
    IllegalURLCMD: {code: "-00007", message: "Invalid request URL"}
};

module.exports = {
    cmdErrors
};
