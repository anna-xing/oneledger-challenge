const {request, requestConfig, offlineSerialize, util, RPC} = require('./internal');
const {defaultEnv} = requestConfig;
const {ErrorType, errorHandler, ErrorUtil} = require("middle_utility").TierError;
const {requestErrors} = ErrorType;

const protocolMethods = {
    VoteProposal: "tx.VoteProposal"
};

/**
 * @description Offline rawTx generator of creating proposal
 * @param parameters {Object} object of parameters
 * @param parameters.proposalType {number} ProposalType. ConfigUpdate: 0x20, CodeChange: 0x21, General: 0x22
 * @param parameters.description {string} Description
 * @param parameters.proposer {string} Proposer
 * @param parameters.initialFunding {object} InitialFunding
 * @param parameters.initialFunding.currency {string} InitialFunding currency, must be OLT
 * @param parameters.initialFunding.value {string} InitialFunding value
 * @param [parameters.gasAdjustment] tx gas adjustment, non-negative int, if not provided, default value will be 0
 * @param [env] {Object} environment parameters object
 * @param env.url {string} environment url (default is Kainos)
 * @param env.storeConfig {Object} store config
 * @param env.storeConfig.platform {string} store type. "electron" or "browser" (default is electron)
 * @param env.storeConfig.storeLocation {string} store location path (default is __dirname)
 * @return {Promise<{response: *}|{error: *}>} rawTx with fee estimation and proposalID
 */
async function proposalCreateTxOffline({proposalType, description, headline, proposer, initialFunding, gasAdjustment = 0}, env = defaultEnv) {
    if (util.isEmpty(description)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalDescription));
    if (util.isEmpty(headline)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalHeadline));
    if (!util.isValidOLTAddress(proposer)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));

    // TODO: fetch proposalType from protocol later
    if (!util.getKeyByValue(requestConfig.ProposalTypes, proposalType)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalType));
    if (initialFunding.currency !== requestConfig.OLT.currency) return Promise.reject(ErrorUtil.errorWrap(requestErrors.UnsupportedCurrency));

    // check gasAdjustment if provided
    if (!Number.isInteger(gasAdjustment) || gasAdjustment < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidGasAdjustment));

    const initialFundingResult = util.requestPriceConverter(initialFunding.value, requestConfig.OLT.decimal);
    if (!initialFundingResult) return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalPrice));
    initialFunding.value = initialFundingResult;

    let gasPrice;
    try {
        const {response} = await request.queryGasPrice(env);
        gasPrice = response
    } catch (err) {
        return Promise.reject(err)
    }

    let proposalOptions
    try {
        proposalOptions = await request.calculateProposalInfo(proposalType, env);
    } catch (err) {
        return Promise.reject(err)
    }
    const {fundingDeadline, votingDeadline, fundingGoal, passPercentage} = proposalOptions;
    const txPayload = {
        proposalType: proposalType,
        proposalDescription: description,
        proposalHeadline: headline,
        proposerAddress: proposer,
        initialFunding: initialFunding,
        fundingDeadline,
        votingDeadline,
        fundingGoal,
        passPercentage
    };

    const assembledTxForID = util.assembleTxData(requestConfig.TxTypes.PROPOSAL_CREATE, txPayload, gasPrice, gasAdjustment);
    let hashedProposalID;
    try {
        hashedProposalID = await util.hash(JSON.stringify(assembledTxForID))
    } catch (err) {
        return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalID))
    }
    if (util.isEmpty(hashedProposalID)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalID));

    const txPayloadFinal = {...txPayload, ...{proposalId: hashedProposalID}};
    const assembledTx = util.assembleTxData(requestConfig.TxTypes.PROPOSAL_CREATE, txPayloadFinal, gasPrice, gasAdjustment);
    const {gas} = assembledTx.fee;
    const feeEstimationResult = await util.txFeeEstimator(gas, gasPrice).catch(err => {
        return Promise.reject(err)
    });
    return Promise.resolve(ErrorUtil.responseWrap({...util.rawTxStructure(offlineSerialize.jsonObjectToBase64(assembledTx)), ...{feeEstimation: feeEstimationResult.response}, ...{proposalID: hashedProposalID}}))
}

/**
 * @description Offline rawTx generator of canceling proposal
 * @param parameters {Object} object of parameters
 * @param parameters.proposalID {string} ProposalID
 * @param parameters.proposer {number} proposer
 * @param parameters.reason {string} cancel reason
 * @param [parameters.gasAdjustment] tx gas adjustment, non-negative int, if not provided, default value will be 0
 * @param [env] {Object} environment parameters object
 * @param env.url {string} environment url (default is Kainos)
 * @param env.storeConfig {Object} store config
 * @param env.storeConfig.platform {string} store type. "electron" or "browser" (default is electron)
 * @param env.storeConfig.storeLocation {string} store location path (default is __dirname)
 * @return {Promise<{response: *}|{error: *}>} rawTx with fee estimation
 */
async function proposalCancelTxOffline({proposalID, proposer, reason, gasAdjustment = 0}, env = defaultEnv) {
    if (util.isEmpty(proposalID)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalID));
    if (util.isEmpty(reason)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidCancelReason));
    if (!util.isValidOLTAddress(proposer)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));

    // check gasAdjustment if provided
    if (!Number.isInteger(gasAdjustment) || gasAdjustment < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidGasAdjustment));

    let gasPrice;
    try {
        const {response} = await request.queryGasPrice(env);
        gasPrice = response
    } catch (err) {
        return Promise.reject(err)
    }

    const tx_dataObj = {
        proposalId: proposalID,
        proposerAddress: proposer,
        cancelReason: reason
    };

    const assembledTx = util.assembleTxData(requestConfig.TxTypes.PROPOSAL_CANCEL, tx_dataObj, gasPrice, gasAdjustment);
    const {gas} = assembledTx.fee;
    const feeEstimationResult = await util.txFeeEstimator(gas, gasPrice).catch(err => {
        return Promise.reject(err)
    });
    return Promise.resolve(ErrorUtil.responseWrap({...util.rawTxStructure(offlineSerialize.jsonObjectToBase64(assembledTx)), ...{feeEstimation: feeEstimationResult.response}}))
}

/**
 * @description Offline rawTx generator of funding proposal
 * @param parameters {Object} object of parameters
 * @param parameters.proposalID {string} proposalID
 * @param parameters.funderAddress {string} funder Address
 * @param parameters.fundValue {object} fundValue
 * @param parameters.fundValue.currency {string} currency of fund, must be OLT
 * @param parameters.fundValue.value {string} value of fund
 * @param [parameters.gasAdjustment] tx gas adjustment, non-negative int, if not provided, default value will be 0
 * @param [env] {Object} environment parameters object
 * @param env.url {string} environment url (default is Kainos)
 * @param env.storeConfig {Object} store config
 * @param env.storeConfig.platform {string} store type. "electron" or "browser" (default is electron)
 * @param env.storeConfig.storeLocation {string} store location path (default is __dirname)
 * @return {Promise<{response: *}|{error: *}>}  rawTx with fee estimation
 */
async function proposalFundTxOffline({proposalID, funderAddress, fundValue, gasAdjustment = 0}, env = defaultEnv) {
    if (util.isEmpty(proposalID)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalID));
    if (!util.isValidOLTAddress(funderAddress)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));
    if (fundValue.currency !== requestConfig.OLT.currency) return Promise.reject(ErrorUtil.errorWrap(requestErrors.UnsupportedCurrency));

    // check gasAdjustment if provided
    if (!Number.isInteger(gasAdjustment) || gasAdjustment < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidGasAdjustment));

    const fundingResult = util.requestPriceConverter(fundValue.value, requestConfig.OLT.decimal);
    if (!fundingResult) return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalPrice));
    fundValue.value = fundingResult;

    let gasPrice;
    try {
        const {response} = await request.queryGasPrice(env);
        gasPrice = response
    } catch (err) {
        return Promise.reject(err)
    }

    const tx_dataObj = {
        proposalId: proposalID,
        funderAddress: funderAddress,
        fundValue: fundValue
    };

    const assembledTx = util.assembleTxData(requestConfig.TxTypes.PROPOSAL_FUND, tx_dataObj, gasPrice, gasAdjustment);
    const {gas} = assembledTx.fee;
    const feeEstimationResult = await util.txFeeEstimator(gas, gasPrice).catch(err => {
        return Promise.reject(err)
    });
    return Promise.resolve(ErrorUtil.responseWrap({...util.rawTxStructure(offlineSerialize.jsonObjectToBase64(assembledTx)), ...{feeEstimation: feeEstimationResult.response}}))
}

/**
 * @description Offline rawTx generator of withdrawal proposal
 * @param parameters {Object} object of parameters
 * @param parameters.proposalID {string} proposalID
 * @param parameters.funder {string} funder
 * @param parameters.withdrawalValue {object} withdrawValue
 * @param parameters.withdrawalValue.currency {string} currency of withdrawal, must be OLT
 * @param parameters.withdrawalValue.value {string} value of withdrawal
 * @param parameters.beneficiary {string}
 * @param [parameters.gasAdjustment] tx gas adjustment, non-negative int, if not provided, default value will be 0
 * @param [env] {Object} environment parameters object
 * @param env.url {string} environment url (default is Kainos)
 * @param env.storeConfig {Object} store config
 * @param env.storeConfig.platform {string} store type. "electron" or "browser" (default is electron)
 * @param env.storeConfig.storeLocation {string} store location path (default is __dirname)
 * @return {Promise<{response: *}|{error: *}>}  rawTx with fee estimation
 */
async function withdrawalFundsTxOffline({proposalID, funder, withdrawalValue, beneficiary, gasAdjustment = 0}, env = defaultEnv) {
    if (util.isEmpty(proposalID)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalID));
    if (!util.isValidOLTAddress(funder) || !util.isValidOLTAddress(beneficiary)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));
    if (withdrawalValue.currency !== requestConfig.OLT.currency) return Promise.reject(ErrorUtil.errorWrap(requestErrors.UnsupportedCurrency));

    const withdrawalValueResult = util.requestPriceConverter(withdrawalValue.value, requestConfig.OLT.decimal);
    if (!withdrawalValueResult) return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalPrice));
    withdrawalValue.value = withdrawalValueResult;

    // check gasAdjustment if provided
    if (!Number.isInteger(gasAdjustment) || gasAdjustment < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidGasAdjustment));

    let gasPrice;
    try {
        const {response} = await request.queryGasPrice(env);
        gasPrice = response
    } catch (err) {
        return Promise.reject(err)
    }

    const tx_dataObj = {
        proposalId: proposalID,
        funderAddress: funder,
        withdrawValue: withdrawalValue,
        beneficiaryAddress: beneficiary
    };

    const assembledTx = util.assembleTxData(requestConfig.TxTypes.PROPOSAL_WITHDRAW_FUNDS, tx_dataObj, gasPrice, gasAdjustment);
    const {gas} = assembledTx.fee;
    const feeEstimationResult = await util.txFeeEstimator(gas, gasPrice).catch(err => {
        return Promise.reject(err)
    });
    return Promise.resolve(ErrorUtil.responseWrap({...util.rawTxStructure(offlineSerialize.jsonObjectToBase64(assembledTx)), ...{feeEstimation: feeEstimationResult.response}}))
}

/**
 * @description Online rawTx generator of voting proposal
 * @param parameters {Object} object of parameters
 * @param parameters.proposalID {string} proposalID
 * @param parameters.address {string} voting address
 * @param parameters.opinion {number} opinion. YES: 0x1, NO: 0x2, GIVEUP: 0x3
 * @param [parameters.gasAdjustment] tx gas adjustment, non-negative int, if not provided, default value will be 0
 * @param [env] {Object} environment parameters object
 * @param env.url {string} environment url (default is Kainos)
 * @param env.storeConfig {Object} store config
 * @param env.storeConfig.platform {string} store type. "electron" or "browser" (default is electron)
 * @param env.storeConfig.storeLocation {string} store location path (default is __dirname)
 * @return {Promise<{response: *}|{error: *}>}  rawTx with fee estimation and signature
 */
async function voteProposalTxOffline({proposalID, address, opinion, gasAdjustment = 0}, env = defaultEnv) {
    if (util.isEmpty(proposalID)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalID));
    if (!util.isValidOLTAddress(address)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));
    if (!util.getKeyByValue(requestConfig.VoteOpinions, opinion)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidVoteOpinion));
    if (!Number.isInteger(gasAdjustment) || gasAdjustment < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidGasAdjustment));

    let gasPrice;
    try {
        const {response} = await request.queryGasPrice(env);
        gasPrice = response
    } catch (err) {
        return Promise.reject(err)
    }

    const validEnvObj = await util.verifyEnvParam(env).catch(error => {
        return Promise.reject(error)
    });

    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json"
    };
    const method = "POST";
    const body = {jsonrpc: "2.0", method: "", id: 1};
    const json = true;
    const options = {
        method: method,
        headers: headers,
        body: body,
        json: json,
        timeout: 3000
    };

    options["url"] = validEnvObj.url;
    body.method = protocolMethods.VoteProposal;

    const assembledTx = util.assembleTxData(requestConfig.TxTypes.PROPOSAL_VOTE, "", gasPrice, gasAdjustment);
    const {gas, price} = assembledTx.fee;

    body["params"] = {
        proposalId: proposalID,
        address: address,
        opinion: opinion,
        gasPrice: price,
        gas,
    };

    const feeEstimationResult = await util.txFeeEstimator(gas, gasPrice).catch(err => {
        return Promise.reject(err)
    });

    return RPC.returnPromise(options).then(response => {
        const {rawTx, signature} = response;
        const obj = {...util.rawTxStructure(rawTx), ...{feeEstimation: feeEstimationResult.response}};
        return Promise.resolve(ErrorUtil.responseWrap({...obj, ...{signature}}))
    }).catch(err => {
        return errorHandler(ErrorUtil.errorWrap(err))
    })
}

/**
 * @description Offline rawTx generator of proposal expire vote
 * @param parameters {Object} object of parameters
 * @param parameters.proposalID {string} proposalID
 * @param parameters.validatorAddress {string} validator Address
 * @param [parameters.gasAdjustment] tx gas adjustment, non-negative int, if not provided, default value will be 0
 * @param [env] {Object} environment parameters object
 * @param env.url {string} environment url (default is Kainos)
 * @param env.storeConfig {Object} store config
 * @param env.storeConfig.platform {string} store type. "electron" or "browser" (default is electron)
 * @param env.storeConfig.storeLocation {string} store location path (default is __dirname)
 * @return {Promise<{response: *}|{error: *}>}  rawTx with fee estimation
 */
async function expireVoteTxOffline({proposalID, validatorAddress, gasAdjustment = 0}, env = defaultEnv) {
    if (util.isEmpty(proposalID)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalID));
    if (!util.isValidOLTAddress(validatorAddress)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));

    // check gasAdjustment if provided
    if (!Number.isInteger(gasAdjustment) || gasAdjustment < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidGasAdjustment));

    let gasPrice;
    try {
        const {response} = await request.queryGasPrice(env);
        gasPrice = response
    } catch (err) {
        return Promise.reject(err)
    }

    const tx_dataObj = {
        proposalId: proposalID,
        validatorAddress: validatorAddress
    };

    const assembledTx = util.assembleTxData(requestConfig.TxTypes.EXPIRE_VOTES, tx_dataObj, gasPrice, gasAdjustment);
    const {gas} = assembledTx.fee;
    const feeEstimationResult = await util.txFeeEstimator(gas, gasPrice).catch(err => {
        return Promise.reject(err)
    });
    return Promise.resolve(ErrorUtil.responseWrap({...util.rawTxStructure(offlineSerialize.jsonObjectToBase64(assembledTx)), ...{feeEstimation: feeEstimationResult.response}}))
}

/**
 * @description Offline rawTx generator of proposal finalize
 * @param parameters {Object} object of parameters
 * @param parameters.proposalID {string} proposalID
 * @param parameters.validatorAddress {string} validator Address
 * @param [parameters.gasAdjustment] tx gas adjustment, non-negative int, if not provided, default value will be 0
 * @param [env] {Object} environment parameters object
 * @param env.url {string} environment url (default is Kainos)
 * @param env.storeConfig {Object} store config
 * @param env.storeConfig.platform {string} store type. "electron" or "browser" (default is electron)
 * @param env.storeConfig.storeLocation {string} store location path (default is __dirname)
 * @return {Promise<{response: *}|{error: *}>}  rawTx with fee estimation
 */
async function finalizeProposalTxOffline({proposalID, validatorAddress, gasAdjustment = 0}, env = defaultEnv) {
    if (util.isEmpty(proposalID)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalID));
    if (!util.isValidOLTAddress(validatorAddress)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));

    // check gasAdjustment if provided
    if (!Number.isInteger(gasAdjustment) || gasAdjustment < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidGasAdjustment));

    let gasPrice;
    try {
        const {response} = await request.queryGasPrice(env);
        gasPrice = response
    } catch (err) {
        return Promise.reject(err)
    }

    const tx_dataObj = {
        proposalId: proposalID,
        validatorAddress: validatorAddress
    };

    const assembledTx = util.assembleTxData(requestConfig.TxTypes.PROPOSAL_FINALIZE, tx_dataObj, gasPrice, gasAdjustment);
    const {gas} = assembledTx.fee;
    const feeEstimationResult = await util.txFeeEstimator(gas, gasPrice).catch(err => {
        return Promise.reject(err)
    });
    return Promise.resolve(ErrorUtil.responseWrap({...util.rawTxStructure(offlineSerialize.jsonObjectToBase64(assembledTx)), ...{feeEstimation: feeEstimationResult.response}}))
}

module.exports = {
    proposalCreateTxOffline,
    proposalCancelTxOffline,
    proposalFundTxOffline,
    withdrawalFundsTxOffline,
    voteProposalTxOffline,
    expireVoteTxOffline,
    finalizeProposalTxOffline
};
