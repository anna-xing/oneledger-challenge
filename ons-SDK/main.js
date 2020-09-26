const {util, requestConfig, request, ons, governance, requestOffline, offlineSerialize} = require("./internal");
const {Ethereum} = require("./ledgerHQ/wallet/ethereum");
const {Oneledger} = require("./ledgerHQ/wallet/oneledger");
const {Bitcoin} = require("./ledgerHQ/wallet/bitcoin");

const LedgerHQ = {
    Wallet: {
        Ethereum,
        Oneledger,
        Bitcoin
    }
};

exports.LedgerHQ = LedgerHQ;
exports.request = request;
exports.requestOffline = requestOffline;
exports.requestConfig = requestConfig;
exports.offlineSerialize = offlineSerialize;

const {domainCreateTxOffline, domainUpdateTxOffline, domainRenewTxOffline, domainSaleTxOffline, domainPurchaseTxOffline, domainDeleteSubTxOffline, sendToAddressTxOffline, sendToDomainTxOffline} = ons;
exports.ONS = {domainCreateTxOffline, domainUpdateTxOffline, domainRenewTxOffline, domainSaleTxOffline, domainPurchaseTxOffline, domainDeleteSubTxOffline};
exports.transfer = {sendToAddressTxOffline, sendToDomainTxOffline};

const {proposalCreateTxOffline, proposalCancelTxOffline, proposalFundTxOffline, withdrawalFundsTxOffline} = governance;
exports.governance = {
    proposalCreateTxOffline,
    proposalCancelTxOffline,
    proposalFundTxOffline,
    withdrawalFundsTxOffline
};

const {validateDomainName, requestPriceConverter, responsePriceConverter, isValidAccountAddress, verifyBeneficiaryAccount, verifyEnvParam, isValidUri, calculateTxGas, isValidTrackerName, getCurrency, txFeeEstimator, loadStoreByKey, assembleTxData, rawTxStructure} = util;
exports.util = {
    validateDomainName,
    requestPriceConverter,
    responsePriceConverter,
    isValidAccountAddress,
    verifyBeneficiaryAccount,
    verifyEnvParam,
    isValidUri,
    calculateTxGas,
    isValidTrackerName,
    getCurrency,
    txFeeEstimator,
    loadStoreByKey,
    assembleTxData,
    rawTxStructure
};
