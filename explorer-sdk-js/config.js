const localURL = "http://127.0.0.1:8080";
const devnetURL = "https://explorer.devnet.oneledger.network";
const devnet2URL = "http://104.198.64.51:8080";
const chronosURL = "https://explorer.chronos.oneledger.network";
const mainnetURL = "https://explorer.kainos.oneledger.network";
const defaultUrl = {
    url: mainnetURL
};

// All registered currencies
// Should be updated according to the Protocol
const registeredCurrencies = ["OLT", "ETH", "BTC"];

// DECIMAL for OLT currency, where 1 OLT will be 10^18 of basic unit
const OLT_DECIMAL = {
    currency: "OLT",
    decimal: 18
};

// offline serialization tx type
const TxType = {
    SEND: 0x01,
    SENDPOOL: 0x02,

    STAKE: 0x11,
    UNSTAKE: 0x12,
    WITHDRAW: 0x13,

    DOMAIN_CREATE: 0x21,
    DOMAIN_UPDATE: 0x22,
    DOMAIN_SELL: 0x23,
    DOMAIN_PURCHASE: 0x24,
    DOMAIN_SEND: 0x25,
    DOMAIN_DELETE_SUB: 0x26,
    DOMAIN_RENEW: 0x27,

    BTC_LOCK: 0x81,
    BTC_ADD_SIGNATURE: 0x82,
    BTC_BROADCAST_SUCCESS: 0x83,
    BTC_REPORT_FINALITY_MINT: 0x84,
    BTC_EXT_MINT: 0x85,
    BTC_REDEEM: 0x86,
    BTC_FAILED_BROADCAST_RESET: 0x87,

    ETH_LOCK: 0x91,
    ETH_REPORT_FINALITY_MINT: 0x92,
    ETH_REDEEM: 0x93,
    ERC20_LOCK: 0x94,
    ERC20_REDEEM: 0x95,

    PROPOSAL_CREATE: 0x30,
    PROPOSAL_CANCEL: 0x31,
    PROPOSAL_FUND: 0x32,
    PROPOSAL_VOTE: 0x33,
    PROPOSAL_FINALIZE: 0x34,
    EXPIRE_VOTES: 0x35,
    PROPOSAL_WITHDRAW_FUNDS: 0x36,

    WITHDRAW_REWARD: 0x41
};

// Mutual tx types
const MutualTxType = {
    SEND: "SEND",
    DOMAIN_SEND: "DOMAIN_SEND",
    DOMAIN_PURCHASE: "DOMAIN_PURCHASE",
    DOMAIN_SELL: "DOMAIN_SELL"
};

// any other tx types will be UNKNOWN
const UNKNOWN = "UNKNOWN";

const TxTypeCode = {
    SEND_RECIPIENT_OLT: "tx_4000",
    SEND_SENDER_OLT: "tx_4001",
    SEND_RECIPIENT_OETH: "tx_4002",
    SEND_SENDER_OETH: "tx_4003",

    DOMAIN_SEND_RECIPIENT_OLT: "tx_4010",
    DOMAIN_SEND_SENDER_OLT: "tx_4011",
    DOMAIN_SEND_RECIPIENT_OETH: "tx_4012",
    DOMAIN_SEND_SENDER_OETH: "tx_4013",

    DOMAIN_CREATE: "tx_4020",
    DOMAIN_UPDATE: "tx_4021",
    DOMAIN_ON_SALE: "tx_4022",
    DOMAIN_OFF_SALE: "tx_4023",
    DOMAIN_PURCHASE_BUYER: "tx_4024",
    DOMAIN_PURCHASE_SELLER: "tx_4025",
    DOMAIN_PURCHASE_SELF: "tx_4026",
    DOMAIN_DELETE_SUB: "tx_4027",
    DOMAIN_RENEW: "tx_4028",
    DOMAIN_PURCHASE: "tx_5000",
    DOMAIN_SELL: "tx_5001",

    STAKE: "tx_4030",
    UNSTAKE: "tx_4031",
    WITHDRAW: "tx_4040",

    BTC_LOCK: "tx_4050",
    BTC_ADD_SIGNATURE: "tx_4051",
    BTC_BROADCAST_SUCCESS: "tx_4052",
    BTC_REPORT_FINALITY_MINT: "tx_4053",
    BTC_EXT_MINT: "tx_4054",
    BTC_REDEEM: "tx_4055",
    BTC_FAILED_BROADCAST_RESET: "tx_4056",

    ETH_LOCK: "tx_4060",
    ETH_REPORT_FINALITY_MINT: "tx_4061",
    ETH_REDEEM: "tx_4062",
    ERC20_LOCK: "tx_4063",
    ERC20_REDEEM: "tx_4064",

    PROPOSAL_CREATE: "tx_4070",
    PROPOSAL_CANCEL: "tx_4071",
    PROPOSAL_FUND: "tx_4072",
    PROPOSAL_VOTE: "tx_4073",
    PROPOSAL_FINALIZE: "tx_4074",
    EXPIRE_VOTES: "tx_4075",
    PROPOSAL_WITHDRAW_FUNDS: "tx_4076",

    REWARDS_WITHDRAW: "tx_4080",

    UNKNOWN: "tx_0000"
};

/**
 * @description ONS tx types
 * this is used to convert recipient account of ONS tx
 * recipient is domain name
 * DOMAIN_SEND should not be here because recipient of DOMAIN_SEND tx is replaced with accountAddress on Explorer
 */
const ONSTx = {
    DOMAIN_CREATE: TxTypeCode.DOMAIN_CREATE,
    DOMAIN_UPDATE: TxTypeCode.DOMAIN_UPDATE,
    DOMAIN_SELL: TxTypeCode.DOMAIN_SELL,
    DOMAIN_PURCHASE: TxTypeCode.DOMAIN_PURCHASE,
    DOMAIN_RENEW: TxTypeCode.DOMAIN_RENEW,
    DOMAIN_DELETE_SUB: TxTypeCode.DOMAIN_DELETE_SUB
};

module.exports = {
    defaultUrl,
    registeredCurrencies,
    OLT_DECIMAL,
    MutualTxType,
    TxTypeCode,
    ONSTx,
    TxType,
    UNKNOWN
};
