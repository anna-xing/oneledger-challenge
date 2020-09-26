const RPC = require("./requestSender");
const requestConfig = require("./requestConfig");
const {defaultEnv} = requestConfig;
const util = require("./util");
const {ErrorType, errorHandler, ErrorUtil} = require("middle_utility").TierError;
const {requestErrors, responseErrors} = ErrorType;

const protocolMethods = {
    CurrencyBalance: "query.CurrencyBalance",
    Balance: "query.Balance",
    ListTxTypes: "query.ListTxTypes",
    GetDomainByName: "query.ONS_GetDomainByName",
    GetDomainByOwner: "query.ONS_GetDomainByOwner",
    GetParentDomainByOwner: "query.ONS_GetParentDomainByOwner",
    GetSubDomainByName: "query.ONS_GetSubDomainByName",
    GetDomainOnSale: "query.ONS_GetDomainOnSale",
    GetDomainByBeneficiary: "query.ONS_GetDomainByBeneficiary",
    GetOptions: "query.ONS_GetOptions",
    FeeOptions: "query.FeeOptions",
    ListProposal: "query.ListProposal",
    ListProposals: "query.ListProposals",
    TxAsync: "broadcast.TxAsync",
    TxSync: "broadcast.TxSync",
    TxCommitMtSig: "broadcast.TxCommitMtSig",
    GetProposalOptions: "query.GetProposalOptions",
    GetFundsForProposalByFunder: "query.GetFundsForProposalByFunder"
};

// Query balance of a specific currency for an account
// if currency is not provided, this function will call queryBalanceForAccount instead.
// this is a wrapper for queryBalanceForAccount
async function queryCurrencyBalanceForAccount({address, currency}, env = defaultEnv) {
    const newOptions = util.deepCloneObject(requestConfig.options);
    const newBody = util.deepCloneObject(requestConfig.body);

    if (util.isEmpty(currency)) {
        return queryBalanceForAccount(address, env)
    }
    if (!util.isValidOLTAddress(address)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));

    const validEnvObj = await util.verifyEnvParam(env).catch(error => {
        return Promise.reject(error)
    });
    newOptions["url"] = validEnvObj.url;

    newBody["params"] = {
        address: address,
        currency: currency
    };

    newBody.method = protocolMethods.CurrencyBalance;
    return RPC.returnPromise({...newOptions, ...{body: newBody}}).then(response => {
        // return obj mapping for query balance
        const {currency, balance, height} = response || {};
        const returnObj = {[currency]: {balance: balance + " " + currency, height: height}};
        return Promise.resolve(ErrorUtil.responseWrap(returnObj));
    }).catch(err => {
        return errorHandler(ErrorUtil.errorWrap(err));
    })
}

/**
 * @description Query all available currency balance of an account
 * @param address {string} account address to query
 * @param [env] {Object} environment parameters object (default is Kainos)
 * @param env.url {string} environment url
 * @return {Promise.<response|error>} Promise.reject: error object , Promise.resolve: response object has all available currency balance
 */
async function queryBalanceForAccount(address, env = defaultEnv) {
    const newOptions = util.deepCloneObject(requestConfig.options);
    const newBody = util.deepCloneObject(requestConfig.body);

    if (!util.isValidOLTAddress(address)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));
    newBody["params"] = {
        address: address
    };

    const validEnvObj = await util.verifyEnvParam(env).catch(error => {
        return Promise.reject(error)
    });
    newOptions["url"] = validEnvObj.url;
    newBody.method = protocolMethods.Balance;

    return RPC.returnPromise({...newOptions, ...{body: newBody}}).then(response => {
        // return obj mapping for query balance
        return ErrorUtil.responseWrap(util.balanceHelper(response));
    }).catch(err => {
        return errorHandler(ErrorUtil.errorWrap(err));
    })
}

/**
 * @description query tx types from protocol
 * @param env
 */
async function queryTxTypes(env = defaultEnv) {
    const newOptions = util.deepCloneObject(requestConfig.options);
    const newBody = util.deepCloneObject(requestConfig.body);

    const validEnvObj = await util.verifyEnvParam(env).catch(error => {
        return Promise.reject(error)
    });

    newOptions["url"] = validEnvObj.url;
    newBody.method = protocolMethods.ListTxTypes;

    return RPC.returnPromise({...newOptions, ...{body: newBody}}).then(response => {
        return Promise.resolve(ErrorUtil.responseWrap(response))
    }).catch(err => {
        return errorHandler(ErrorUtil.errorWrap(err))
    })
}

/**
 * @description Query domains
 * Please refer to SDK doc for how to query domain
 * @param parameters {Object} object of parameters
 * @param parameters.queryDomainType {string} different ways to query domain: 1) ByName, 2) ByOwner, 3) ParentDomainByOwner 4) SubDomainByName 5) OnSale 6) ByBeneficiaryAccount
 * @param parameters.domainName {string} domain name if queryDomainType is domainName or SubDomainByName, pass parent domain name if type is SubDomainByName
 * @param parameters.owner {string} domain owner if queryDomainType is ByOwner or ParentDomainByOwner, if type is ParentDomainByOwner, onSale will also be effective as a filter
 * @param parameters.onSale {boolean} domain onSale flag if queryDomainType is OnSale
 * @param parameters.beneficiaryAccount {string} domain beneficiary account if queryDomainType is ByBeneficiaryAccount
 * @param [env] {Object} environment parameters object (default is Kainos)
 * @param env.url {string} environment url
 * @return {Promise.<response|error>} Promise.reject: error object, Promise.resolve: response object has array of domain info
 */
async function queryDomains({queryDomainType, domainName, owner, onSale, beneficiaryAccount}, env = defaultEnv) {
    const newOptions = util.deepCloneObject(requestConfig.options);
    const newBody = util.deepCloneObject(requestConfig.body);

    newBody["params"] = {
        name: domainName,
        owner: owner,
        onSale: onSale,
        beneficiary: beneficiaryAccount
    };

    const validEnvObj = await util.verifyEnvParam(env).catch(error => {
        return Promise.reject(error)
    });
    newOptions["url"] = validEnvObj.url;
    const {storeConfig} = env;
    switch (queryDomainType) {
        case requestConfig.QueryDomainType.ByName:
            await util.validateDomainName(domainName, storeConfig).catch(err => {
                const returnErr = {
                    code: requestErrors.IllegalDomainName.code,
                    message: requestErrors.IllegalDomainName.message,
                    detail: `${err}`
                };
                return Promise.reject(ErrorUtil.errorWrap(returnErr))
            });
            newBody.params.name = util.lowerCaseDomainName(domainName);
            newBody.method = protocolMethods.GetDomainByName;
            break;
        case requestConfig.QueryDomainType.ByOwner:
            if (!util.isValidOLTAddress(owner)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));
            newBody.method = protocolMethods.GetDomainByOwner;
            break;
        case requestConfig.QueryDomainType.ParentDomainByOwner:
            if (!util.isValidOLTAddress(owner)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));
            newBody.method = protocolMethods.GetParentDomainByOwner;
            break;
        case requestConfig.QueryDomainType.SubDomainByName:
            await util.validateDomainName(domainName, storeConfig).catch(err => {
                const returnErr = {
                    code: requestErrors.IllegalDomainName.code,
                    message: requestErrors.IllegalDomainName.message,
                    detail: `${err}`
                };
                return Promise.reject(ErrorUtil.errorWrap(returnErr))
            });
            newBody.params.name = util.lowerCaseDomainName(domainName);
            newBody.method = protocolMethods.GetSubDomainByName;
            break;
        case requestConfig.QueryDomainType.OnSale:
            await util.domainOnSaleFlagChecker(onSale).catch(error => {
                return Promise.reject(error)
            });
            newBody.method = protocolMethods.GetDomainOnSale;
            break;
        case requestConfig.QueryDomainType.ByBeneficiaryAccount:
            if (!util.isValidString(beneficiaryAccount)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalAddress));
            newBody.method = protocolMethods.GetDomainByBeneficiary;
            break;
        default:
            return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalQueryDomainType))
    }
    return RPC.returnPromise({...newOptions, ...{body: newBody}}).then(async response => {
        let {domains, height} = response || {};
        if (typeof domains === "undefined" && typeof height === "undefined") domains = [];
        if (!(domains instanceof Array)) return Promise.reject(requestErrors.IllegalQueryReply);
        if (domains.length === 0) return Promise.resolve(ErrorUtil.responseWrap(domains));
        const domainList = await util.parseDomainReply(domains, validEnvObj, height).catch(err => {
            return Promise.reject(err)
        })
        if (domainList.length > 0) return Promise.resolve(ErrorUtil.responseWrap(domainList));
    }).catch(err => {
        return errorHandler(ErrorUtil.errorWrap(err))
    })
}

/**
 * @description query tracker status
 * @param parameters {Object} object of parameters
 * @param parameters.trackerName {string} tracker name, tracker name can be found in tx history
 * @param [parameters.chainType] {string} chain type of the tracker, default is "ETH" (only support ETH at this moment)
 * @param [env] {Object} environment parameters object (default is Kainos)
 * @param env.url {string} environment url
 * @return {Promise.<response|error>} Promise.reject: error object , Promise.resolve: response object of interoperability tx status
 */
async function queryTracker({trackerName, chainType = "ETH"}, env = defaultEnv) {
    const newOptions = util.deepCloneObject(requestConfig.options);
    const newBody = util.deepCloneObject(requestConfig.body);

    if (!util.isValidTrackerName(trackerName)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidArgument));

    const chainTypeTrackerMapping = {
        "ETH": "eth.GetTrackerStatus"
    };
    if (!(chainType in chainTypeTrackerMapping)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidTrackerQueryChainType));

    const validEnvObj = await util.verifyEnvParam(env).catch(error => {
        return Promise.reject(error)
    });
    newOptions["url"] = validEnvObj.url;
    newBody["params"] = {
        trackerName: trackerName
    };
    newBody.method = chainTypeTrackerMapping[chainType];
    return RPC.returnPromise({...newOptions, ...{body: newBody}}).then(response => {
        return Promise.resolve(ErrorUtil.responseWrap(response));
    }).catch(err => {
        return errorHandler(ErrorUtil.errorWrap(err));
    })
}

/**
 * @description query domain base options which is from genesis file
 * @param env
 */
async function queryONSOptions(env = defaultEnv) {
    const newOptions = util.deepCloneObject(requestConfig.options);
    const newBody = util.deepCloneObject(requestConfig.body);

    const validEnvObj = await util.verifyEnvParam(env).catch(error => {
        return Promise.reject(error)
    });

    newOptions["url"] = validEnvObj.url;
    newBody.method = protocolMethods.GetOptions;

    return RPC.returnPromise({...newOptions, ...{body: newBody}}).then(response => {
        return Promise.resolve(ErrorUtil.responseWrap(response))
    }).catch(err => {
        return errorHandler(ErrorUtil.errorWrap(err))
    })
}

/**
 * @description query domain price rate
 * @param env
 */
async function queryDomainPriceRate(env = defaultEnv) {
    const domainOptions = await queryONSOptions(env).catch(error => {
        return Promise.reject(error)
    });

    const {options} = domainOptions.response;
    const {currency, perBlockFees} = options || "";
    if (currency !== requestConfig.OLT.currency || perBlockFees === "") return Promise.reject(ErrorUtil.errorWrap(requestErrors.GetDomainPriceRateError));
    const perBlockFeesInOLT = util.responsePriceConverter(perBlockFees, requestConfig.OLT.decimal);
    const domainPriceRateObj = {
        currency: currency,
        pricePerBlock: perBlockFeesInOLT
    };
    return Promise.resolve(ErrorUtil.responseWrap(domainPriceRateObj))
}

/**
 * @description calculate total domain price based on the number of block
 * @param blockNum {number}
 * @param env
 */
async function calculateDomainPrice(blockNum, env = defaultEnv) {
    if (util.isEmpty(blockNum) || !Number.isInteger(blockNum) || blockNum < 0) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidArgument));

    const {response} = await queryDomainPriceRate(env).catch(error => {
        return Promise.reject(error)
    });
    const {currency, pricePerBlock} = response;
    const totalPriceNum = blockNum * Number(pricePerBlock);
    const domainTotalPrice = {
        currency: currency,
        totalPrice: totalPriceNum.toString(),
        subdomainPrice: requestConfig.subdomainCreationBasePrice.toString() // TODO: subdomain creation base price is hardcoded for now, need to fetch from protocol later
    };
    return Promise.resolve(ErrorUtil.responseWrap(domainTotalPrice))
}

/**
 * @description calculate absolute minimum domain creation price
 * @param env
 */
async function getAbsoluteMinDomainCreationPrice(env = defaultEnv) {
    const domainPriceRate = await queryDomainPriceRate(env).catch(error => {
        return Promise.reject(error)
    });
    const {pricePerBlock} = domainPriceRate.response;

    const basePrice = await queryDomainCreationBasePrice(env).catch(error => {
        return Promise.reject(error)
    });
    const {value} = basePrice.response;

    if (domainPriceRate.response.currency !== basePrice.response.currency) return Promise.reject(ErrorUtil.errorWrap(requestErrors.FetchAbsoluteMinimumDomainCreationPriceError));

    const absoluteMinPriceNum = parseFloat(value) + parseFloat(pricePerBlock);
    const domainCreationMinPrice = {
        currency: domainPriceRate.response.currency,
        absoluteMinPrice: absoluteMinPriceNum.toString()
    };
    return Promise.resolve(ErrorUtil.responseWrap(domainCreationMinPrice))
}

/**
 * @description query domain creation base price
 * @param env
 */
async function queryDomainCreationBasePrice(env = defaultEnv) {
    const domainOptions = await queryONSOptions(env).catch(error => {
        return Promise.reject(error)
    });
    const {options} = domainOptions.response;
    const {currency, baseDomainPrice} = options || "";
    if (currency !== requestConfig.OLT.currency || baseDomainPrice === "") return Promise.reject(ErrorUtil.errorWrap(requestErrors.GetBaseDomainPriceError));
    const basePrice = util.responsePriceConverter(baseDomainPrice, requestConfig.OLT.decimal);
    return Promise.resolve(ErrorUtil.responseWrap({currency: currency, value: basePrice}))
}

/**
 * @description update SDK config file from protocol
 * @param env
 */
async function updateSDKConfig(env = defaultEnv) {
    //this array will contain all configs that need to be updated
    //each element in this array should be {configKey: xxx, configValue: yyy}
    const configsToUpdate = [];

    //txTypes
    const txTypesResult = await queryTxTypes(env).catch(error => {
        return Promise.reject(error)
    });
    const txTypes = txTypesResult.response.txTypes;
    const txTypesToUpdate = {configKey: "txTypes", configValue: txTypes};
    //add txTypes to configsToUpdate
    if (util.isEmpty(txTypesToUpdate.configKey) || util.isEmpty(txTypesToUpdate.configValue)) throw Error("txTypes is not valid");
    configsToUpdate.push(txTypesToUpdate);
    //TODO: future configs that needs to be updated will be added to configsToUpdate

    //write to store
    const configEnv = {
        platform: env.storeConfig.platform,
        storeName: requestConfig.sdkConfigFileName,
        storeLocation: env.storeConfig.storeLocation,
        //this is only used when there is no configuration file, so just leave it
        defaultData: undefined
    };
    configsToUpdate.forEach(element => {
        util.updateStore(configEnv, element.configKey, element.configValue);
    })
}

/**
 * @description query fee option which is from genesis file
 * @param env
 */
async function queryFeeOption(env = defaultEnv) {
    const newOptions = util.deepCloneObject(requestConfig.options);
    const newBody = util.deepCloneObject(requestConfig.body);

    const validEnvObj = await util.verifyEnvParam(env).catch(error => {
        return Promise.reject(error)
    });

    newOptions["url"] = validEnvObj.url;
    newBody.method = protocolMethods.FeeOptions;

    return RPC.returnPromise({...newOptions, ...{body: newBody}}).then(response => {
        return Promise.resolve(ErrorUtil.responseWrap(response))
    }).catch(err => {
        return errorHandler(ErrorUtil.errorWrap(err))
    })
}

/**
 * @description query gas price from protocol
 * @param env
 */
async function queryGasPrice(env = defaultEnv) {
    const feeOptions = await queryFeeOption(env).catch(error => {
        return Promise.reject(error)
    });
    const {feeOption} = feeOptions.response;
    const {feeCurrency, minFeeDecimal} = feeOption;
    // gasPrice always start with `1`, (feeCurrency.decimal - minFeeDecimal) will determine the final gasPrice
    const priceStr = "1" + "0".repeat(feeCurrency.decimal - minFeeDecimal);
    return Promise.resolve(ErrorUtil.responseWrap({
        currency: feeCurrency.name,
        value: priceStr
    }))
}

/**
 * @description Query proposal
 * Please refer to SDK doc for how to query proposal
 * @param parameters {Object} object of parameters
 * @param parameters.queryProposalType {string} different ways to query queryProposalType: 1)ByProposalID, 2)ByProposalState, 3)ByProposer, 4)ByProposalType, 5)AllProposals, 6)MixConditions
 * Provide the associated param only according to the query type if query type is either ByProposalID, ByProposalState, ByProposer or ByProposalType.
 * There is no need to provide any params if query type is AllProposals.
 * provide any valid params for state, proposer and proposalType if query type is MixConditions.
 * @param parameters.proposalID {string} proposalID if queryProposalType is ByProposalID
 * @param parameters.state {string} proposal state if queryProposalType is ByProposalState. Active: 0x31, Passed: 0x32, Failed: 0x33, Finalized: 0x34, FinalizeFailed: 0x35
 * @param parameters.proposer {string} proposer OLT address if queryProposalType is ByProposer
 * @param parameters.proposalType {string} proposal Type if queryProposalType is ByProposalType. ConfigUpdate: 0x20, CodeChange: 0x21, General: 0x22
 * @param [env] {Object} environment parameters object (default is Kainos)
 * @param env.url {string} environment url
 * @return {Promise.<response|error>} Promise.reject: error object, Promise.resolve: response object has array of proposal info
 */
async function queryProposal({queryProposalType, proposalID, state, proposer, proposalType}, env = defaultEnv) {
    const newOptions = util.deepCloneObject(requestConfig.options);
    const newBody = util.deepCloneObject(requestConfig.body);
    const validEnvObj = await util.verifyEnvParam(env).catch(error => {
        return Promise.reject(error)
    });
    newOptions["url"] = validEnvObj.url;

    switch (queryProposalType) {
        case requestConfig.QueryProposalType.AllProposals:
            newBody.method = protocolMethods.ListProposals;
            newBody["params"] = {
                state: requestConfig.ProposalState.StateError,
                proposer: "",
                proposalType: requestConfig.ProposalTypes.Invalid
            };
            break;
        case requestConfig.QueryProposalType.ByProposalID:
            if (util.isEmpty(proposalID)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalID));
            newBody.method = protocolMethods.ListProposal;
            newBody["params"] = {proposalId: proposalID};
            break;
        case requestConfig.QueryProposalType.ByProposalState:
            if (!util.getKeyByValue(requestConfig.ProposalState, state)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalState));
            newBody.method = protocolMethods.ListProposals;
            newBody["params"] = {
                state: state,
                proposer: "",
                proposalType: requestConfig.ProposalTypes.Invalid
            };
            break;
        case requestConfig.QueryProposalType.ByProposer:
            if (!util.isValidOLTAddress(proposer)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));
            newBody.method = protocolMethods.ListProposals;
            newBody["params"] = {
                state: requestConfig.ProposalState.StateError,
                proposer: proposer,
                proposalType: requestConfig.ProposalTypes.Invalid
            };
            break;
        case requestConfig.QueryProposalType.ByProposalType:
            if (!util.getKeyByValue(requestConfig.ProposalTypes, proposalType)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalType));
            newBody.method = protocolMethods.ListProposals;
            newBody["params"] = {
                state: requestConfig.ProposalState.StateError,
                proposer: "",
                proposalType: proposalType
            };
            break;
        case requestConfig.QueryProposalType.MixConditions:
            newBody.method = protocolMethods.ListProposals;
            if (!util.isEmpty(state) && !util.getKeyByValue(requestConfig.ProposalState, state)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalState));
            if (!util.isEmpty(proposer) && !util.isValidOLTAddress(proposer)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));
            if (!util.isEmpty(proposalType) && !util.getKeyByValue(requestConfig.ProposalTypes, proposalType)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalType));
            newBody["params"] = {
                state: state || requestConfig.ProposalState.StateError,
                proposer: proposer || "",
                proposalType: proposalType || requestConfig.ProposalTypes.Invalid
            };
            break;
        default:
            return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalQueryProposalType))
    }
    return RPC.returnPromise({...newOptions, ...{body: newBody}}).then(response => {
        let {proposalStats, height} = response || {};
        if (typeof proposalStats === "undefined" && typeof height === "undefined") proposalStats = [];
        if (!(proposalStats instanceof Array)) return Promise.reject(requestErrors.IllegalQueryReply);
        if (proposalStats.length === 0) return Promise.resolve(ErrorUtil.responseWrap(proposalStats));
        let reps;
        try {
            reps = util.parseProposalReply(proposalStats, height)
        } catch (err) {
            const returnErr = requestErrors.IllegalQueryReply;
            returnErr.detail = err.toString() || "error during parse proposal query reply";
            return Promise.reject(returnErr)
        }
        if (proposalStats.length > 0) return Promise.resolve(ErrorUtil.responseWrap(reps))
    }).catch(err => {
        return errorHandler(ErrorUtil.errorWrap(err))
    })
}

/**
 * @description Broadcast tx by different ways
 * @param parameters {Object} object of parameters
 * @param parameters.broadcastType {string} broadcasting a tx by 1) Async, 2) Sync, 3) TxCommitMtSig: in this case, only otherSignature will be in effect, signature and publicKey params will not be used.
 * @param parameters.rawTx {string} base64 encoded serialized tx string
 * @param parameters.signature {string} tx signature
 * @param parameters.publicKey {Object} tx signer's public key object
 * @param parameters.publicKey.keyType {string} tx signer's public key type
 * @param parameters.publicKey.data {string} tx signer's public key
 * @param [parameters.otherSignature] {Array<{signature, publicKey}>} other signature object, ONLY provide this param when broadcastType is CommitMtSig
 * @param parameters.otherSignature.signature {string} other signature
 * @param parameters.otherSignature.publicKey {Object} other signature's pubkey
 * @param parameters.otherSignature.publicKey.keyType {string} other signature's pubkey type
 * @param parameters.otherSignature.publicKey.data {string} other signature's pubkey data
 * @param [env] {Object} environment parameters object (default is Kainos)
 * @param env.url {string} environment url
 * @return {Promise.<response|error>} Promise.reject: error object , Promise.resolve: response object has tx hash and block height
 */
async function broadcastTx({broadcastType, rawTx, signature, publicKey, otherSignature}, env = defaultEnv) {
    const newOptions = util.deepCloneObject(requestConfig.options);
    const newBody = util.deepCloneObject(requestConfig.body);
    newBody['params'] = {
        rawTx: rawTx,
        signature: signature,
        publicKey: publicKey
    };

    const validEnvObj = await util.verifyEnvParam(env).catch(error => {
        return Promise.reject(error)
    });
    newOptions["url"] = validEnvObj.url;

    switch (broadcastType) {
        case requestConfig.BroadcastType.Async:
            newBody.method = protocolMethods.TxAsync;
            break;
        case requestConfig.BroadcastType.Sync:
            newBody.method = protocolMethods.TxSync;
            break;
        case requestConfig.BroadcastType.TxCommitMtSig:
            newBody.method = protocolMethods.TxCommitMtSig;
            if (!(otherSignature instanceof Array)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalSignatureArray));
            if (otherSignature.length === 0) return Promise.resolve(ErrorUtil.responseWrap(requestErrors.IllegalSignatureArray));
            const allSignature = [];
            otherSignature.forEach(e => {
                const {signature, publicKey} = e || "";
                const {keyType, data} = publicKey || "";
                const obj = {
                    Signed: signature,
                    Signer: {
                        keyType,
                        data
                    }
                }
                allSignature.push(obj)
            })
            newBody['params'] = {
                rawTx: rawTx,
                signatures: allSignature
            };
            break;
        default:
            return Promise.reject(ErrorUtil.errorWrap(requestErrors.IllegalBroadCaseType))
    }
    return RPC.returnPromise({...newOptions, ...{body: newBody}}).then(response => {
        // return obj mapping for broadcast
        const {txHash, ok, height, log} = response || {};
        if (!ok) {
            const returnError = {code: responseErrors.FailToBroadcastError.code, message: log};
            return Promise.reject(returnError);
        }
        const returnObj = {
            txHash: `${requestConfig.txHashPrefix}${txHash}`,
            height: height
        };
        return Promise.resolve(ErrorUtil.responseWrap(returnObj))
    }).catch(err => {
        return errorHandler(ErrorUtil.errorWrap(err))
    })
}

/**
 * @description query proposal options and current height
 * @param [env] {Object} environment parameters object (default is Kainos)
 * @param env.url {string} environment url
 * @return {Promise.<response|error>} Promise.reject: error object , Promise.resolve: response object has proposal options and block height
 */
async function queryProposalOptions(env = defaultEnv) {
    const newOptions = util.deepCloneObject(requestConfig.options);
    const newBody = util.deepCloneObject(requestConfig.body);

    const validEnvObj = await util.verifyEnvParam(env).catch(error => {
        return Promise.reject(error)
    });

    newOptions["url"] = validEnvObj.url;
    newBody.method = protocolMethods.GetProposalOptions;

    return RPC.returnPromise({...newOptions, ...{body: newBody}}).then(response => {
        return Promise.resolve(ErrorUtil.responseWrap(response))
    }).catch(err => {
        return errorHandler(ErrorUtil.errorWrap(err))
    })
}

/**
 * @description calculate proposal info based on proposal options and current height
 * @param proposalType
 * @param [env] {Object} environment parameters object (default is Kainos)
 * @param env.url {string} environment url
 * @return {Promise.<response|error>} Promise.reject: error object , Promise.resolve: response object has calculated proposal options
 */
async function calculateProposalInfo(proposalType, env) {
    const returnErr = util.deepCloneObject(requestErrors.GetProposalOptionError);
    const re = await queryProposalOptions(env).catch(error => {
        return Promise.reject(error)
    });
    const {response} = re;
    if (response === undefined) {
        returnErr.detail = "error get response";
        return Promise.reject(ErrorUtil.errorWrap(returnErr));
    }
    const {height} = response;
    if (height === undefined) {
        returnErr.detail = "error get current height";
        return Promise.reject(ErrorUtil.errorWrap(returnErr));
    }
    const {proposalOptions} = response;
    if (proposalOptions === undefined) {
        returnErr.detail = "error get proposal options";
        return Promise.reject(ErrorUtil.errorWrap(returnErr));
    }
    const {configUpdate, codeChange, general} = proposalOptions;
    if (configUpdate === undefined || codeChange === undefined || general === undefined) {
        returnErr.detail = "error get either of three types' proposal options";
        return Promise.reject(ErrorUtil.errorWrap(returnErr));
    }
    let options = {};
    const calculateResult = {};
    switch (proposalType) {
        case requestConfig.ProposalTypes.ConfigUpdate:
            options = configUpdate;
            break;
        case requestConfig.ProposalTypes.CodeChange:
            options = codeChange;
            break;
        case requestConfig.ProposalTypes.General:
            options = general;
            break;
        default:
            return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalType));
    }
    calculateResult.fundingDeadline = height + options.fundingDeadline;
    calculateResult.votingDeadline = calculateResult.fundingDeadline + options.votingDeadline;
    calculateResult.fundingGoal = options.fundingGoal;
    calculateResult.fundingGoalForUI = `${util.responsePriceConverter(options.fundingGoal, requestConfig.OLT.decimal)} ${requestConfig.OLT.currency}`;
    calculateResult.passPercentage = options.passPercentage;

    return Promise.resolve(calculateResult)
}

/**
 * @description get funds amount that a proposal has funded by a funder
 * @param parameters.proposalID {string} proposalID
 * @param parameters.funder {string} funder OLT address
 * @param [env] {Object} environment parameters object (default is Kainos)
 * @param env.url {string} environment url
 * @return {Promise.<response|error>} Promise.reject: error object , Promise.resolve: response object has funds amount
 */
async function queryFundsForProposalByFunder({proposalID, funder}, env = defaultEnv) {
    if (util.isEmpty(proposalID)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidProposalID));
    if (!util.isValidOLTAddress(funder)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddress));

    const newOptions = util.deepCloneObject(requestConfig.options);
    const newBody = util.deepCloneObject(requestConfig.body);
    const validEnvObj = await util.verifyEnvParam(env).catch(error => {
        return Promise.reject(error)
    });
    newOptions["url"] = validEnvObj.url;

    newBody["params"] = {
        proposalId: proposalID,
        funderAddress: funder
    };
    newBody.method = protocolMethods.GetFundsForProposalByFunder;

    return RPC.returnPromise({...newOptions, ...{body: newBody}}).then(response => {
        let {amount} = response;
        if (typeof amount === "undefined") return Promise.reject(requestErrors.IllegalQueryReply);
        const amountForUI = `${util.responsePriceConverter(amount, requestConfig.OLT.decimal)} ${requestConfig.OLT.currency}`
        return Promise.resolve(ErrorUtil.responseWrap(amountForUI))
    }).catch(err => {
        return errorHandler(ErrorUtil.errorWrap(err))
    })
}

/**
 * @description customized query function, to support query related to external apps
 * @param customMethod {string} custom query method
 * @param [customParams] {Object} custom parameters
 * @param [env] {Object} environment parameters object (default is Kainos)
 * @param env.url {string} environment url
 * @return {Promise.<response|error>} Promise.reject: error object , Promise.resolve: response object of the query
 */
async function queryCustom(customMethod, customParams, env = defaultEnv) {
    const newOptions = util.deepCloneObject(requestConfig.options);
    const newBody = util.deepCloneObject(requestConfig.body);

    newBody["params"] = customParams;

    const validEnvObj = await util.verifyEnvParam(env).catch(error => {
        return Promise.reject(error)
    });

    // check method if provided
    if (!util.isValidMethod(customMethod)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidMethod));

    newOptions["url"] = validEnvObj.url;
    newBody.method = customMethod;
    return RPC.returnPromise({...newOptions, ...{body: newBody}}).then(response => {
        return ErrorUtil.responseWrap(response);
    }).catch(err => {
        return errorHandler(ErrorUtil.errorWrap(err));
    })
}

module.exports = {
    queryCurrencyBalanceForAccount,
    broadcastTx,
    queryBalanceForAccount,
    queryTxTypes,
    updateSDKConfig,
    queryDomains,
    queryDomainPriceRate,
    calculateDomainPrice,
    getAbsoluteMinDomainCreationPrice,
    queryDomainCreationBasePrice,
    queryGasPrice,
    queryTracker,
    queryProposal,
    queryProposalOptions,
    calculateProposalInfo,
    queryFundsForProposalByFunder,
    queryCustom
};
