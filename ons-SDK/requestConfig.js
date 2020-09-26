const headers = {
    "Content-Type": "application/json",
    Accept: "application/json"
};
const method = "POST";
const body = {jsonrpc: "2.0", method: "", id: 1};
const json = true;
const txHashPrefix = "0x";

const options = {
    method: method,
    headers: headers,
    body: body,
    json: json,
    timeout: 3000
};

const BroadcastType = {
    Async: "Async",
    Sync: "Sync",
    TxCommitMtSig: "TxCommitMtSig"
};

const QueryDomainType = {
    ByName: "ByName",
    ByOwner: "ByOwner",
    ParentDomainByOwner: "ParentDomainByOwner",
    SubDomainByName: "SubDomainByName",
    OnSale: "OnSale",
    ByBeneficiaryAccount: "ByBeneficiaryAccount"
};

const QueryProposalType = {
    ByProposalID: "ByProposalID",
    ByProposalState: "ByProposalState",
    ByProposer: "ByProposer",
    ByProposalType: "ByProposalType",
    AllProposals: "AllProposals",
    MixConditions: "MixConditions"
};

// publicKey type for Ed25519
const PublicKeyTypes = {
    publicKeyType: "ed25519"
};

// DECIMAL and currency name for OLT currency, where 1 OLT will be 10^18 of NUE
const OLT = {
    currency: "OLT",
    decimal: 18
};

// DECIMAL and currency name for ETH currency, where 1 ETH will be 10^18 of WEI
const ETH = {
    currency: "ETH",
    decimal: 18
};

// DECIMAL and currency name for GNUE currency, where 1 GNUE will be 10^9 of NUE
const GNUE = {
    currency: "GNUE",
    decimal: 9
};

const Currencies = {
    OLT: OLT,
    GNUE: GNUE,
    ETH: ETH,
};

// address types for address verification
const DomainType = {
    OLT: "OLT",
    ETH: "ETH",
    BTC: "BTC"
};

// offline serialization tx type
const TxTypes = {
    SEND: 0x01,

    // staking tx
    APPLYVALIDATOR: 0x11,
    WITHDRAW: 0x12,
    PURGE: 0x13,

    // Domain tx
    DOMAIN_CREATE: 0x21,
    DOMAIN_UPDATE: 0x22,
    DOMAIN_SELL: 0x23,
    DOMAIN_PURCHASE: 0x24,
    DOMAIN_SEND: 0x25,
    DOMAIN_DELETE_SUB: 0x26,
    DOMAIN_RENEW: 0x27,

    // BitCoin tx
    BTC_LOCK: 0x81,
    BTC_ADD_SIGNATURE: 0x82,
    BTC_BROADCAST_SUCCESS: 0x83,
    BTC_REPORT_FINALITY_MINT: 0x84,
    BTC_EXT_MINT: 0x85,
    BTC_REDEEM: 0x86,
    BTC_FAILED_BROADCAST_RESET: 0x87,

    // Ethereum tx
    ETH_LOCK: 0x91,
    ETH_REPORT_FINALITY_MINT: 0x92,
    ETH_REDEEM: 0x93,
    ERC20_LOCK: 0x94,
    ERC20_REDEEM: 0x95,

    // Governance tx
    PROPOSAL_CREATE: 0x30,
    PROPOSAL_CANCEL: 0x31,
    PROPOSAL_FUND: 0x32,
    PROPOSAL_VOTE: 0x33,
    PROPOSAL_FINALIZE: 0x34,
    EXPIRE_VOTES: 0x35,
    PROPOSAL_WITHDRAW_FUNDS: 0x36
};

// default tx gas limit for different tx type
const txGas = 40000;
const domainTxGas = 80000;
const interoperabilityTxGas = 1000000;
const governanceTxGas = 80000;

const defaultTxGas = {
    SEND: txGas,
    APPLYVALIDATOR: txGas,
    WITHDRAW: txGas,
    PURGE: txGas,

    DOMAIN_CREATE: domainTxGas,
    DOMAIN_UPDATE: domainTxGas,
    DOMAIN_SELL: domainTxGas,
    DOMAIN_PURCHASE: domainTxGas,
    DOMAIN_SEND: domainTxGas,
    DOMAIN_DELETE_SUB: domainTxGas,
    DOMAIN_RENEW: domainTxGas,

    BTC_LOCK: interoperabilityTxGas,
    BTC_ADD_SIGNATURE: interoperabilityTxGas,
    BTC_BROADCAST_SUCCESS: interoperabilityTxGas,
    BTC_REPORT_FINALITY_MINT: interoperabilityTxGas,
    BTC_EXT_MINT: interoperabilityTxGas,
    BTC_REDEEM: interoperabilityTxGas,
    BTC_FAILED_BROADCAST_RESET: interoperabilityTxGas,

    ETH_LOCK: interoperabilityTxGas,
    ETH_REPORT_FINALITY_MINT: interoperabilityTxGas,
    ETH_REDEEM: interoperabilityTxGas,
    ERC20_LOCK: interoperabilityTxGas,
    ERC20_REDEEM: interoperabilityTxGas,

    PROPOSAL_CREATE: governanceTxGas,
    PROPOSAL_CANCEL: governanceTxGas,
    PROPOSAL_FUND: governanceTxGas,
    PROPOSAL_VOTE: governanceTxGas,
    PROPOSAL_FINALIZE: governanceTxGas,
    EXPIRE_VOTES: governanceTxGas,
    PROPOSAL_WITHDRAW_FUNDS: governanceTxGas
};

const DevnetUrl = "https://fullnode-sdk.devnet.oneledger.network/jsonrpc";
const ChronosUrl = "https://fullnode-sdk.chronos.oneledger.network/jsonrpc";
const MainnetUrl = "https://fullnode-sdk.kainos.oneledger.network/jsonrpc";

const defaultEnv = {
    url: MainnetUrl,
    storeConfig: {
        platform: "electron",
        storeLocation: __dirname
    }
};

const sdkConfigFileName = "oneledger_sdk_config.json";

const subdomainCreationBasePrice = 1000.0001;

const ProposalTypes = {
    Invalid: 0xEE,

    ConfigUpdate: 0x20,
    CodeChange: 0x21,
    General: 0x22
}

const VoteOpinions = {
    UNKNOWN: 0x0,

    POSITIVE: 0x1,
    NEGATIVE: 0x2,
    GIVEUP: 0x3
}

const ProposalState = {
    StateError: 0xEE,

    StateActive: 0x32,
    StatePassed: 0x33,
    StateFailed: 0x34,
    StateFinalized: 0x35,
    StateFinalizeFailed: 0x36
}

const ProposalOutcome = {
    InProgress: 0x26,
    InsufficientFunds: 0x27,
    InsufficientVotes: 0x28,
    CompletedNo: 0x29,
    Cancelled: 0x30,
    CompletedYes: 0x31
}

const ProposalStatus = {
    Funding: 0x23,
    Voting: 0x24,
    Completed: 0x25
}

const ProposalUIStatus = {
    Unknown: 0xEE,
    FundingInProgress: 0x01,
    VotingInProgress: 0x02,
    Approved: 0x03,
    Rejected: 0x04,
    FundingFailed: 0x05,
    Cancelled: 0x06,
    Expired: 0x07
}

const defaultBalanceReturnObj = (height) => {
    return {
        OLT: {balance: "0 OLT", height: height},
        ETH: {balance: "0 ETH", height: height}
    }
};

module.exports = {
    BroadcastType,
    QueryDomainType,
    QueryProposalType,
    PublicKeyTypes,
    OLT,
    GNUE,
    ETH,
    Currencies,
    TxTypes,
    DomainType,
    defaultEnv,
    defaultTxGas,
    sdkConfigFileName,
    subdomainCreationBasePrice,
    ProposalTypes,
    VoteOpinions,
    ProposalState,
    ProposalOutcome,
    ProposalStatus,
    ProposalUIStatus,
    defaultBalanceReturnObj,
    headers,
    method,
    body,
    json,
    txHashPrefix,
    options
};
