const {defaultEnv} = require("../requestConfig");
const fs = require("fs");

const chronosURL = "https://fullnode-sdk.chronos.oneledger.network/jsonrpc";
const devnetURL = "https://fullnode-sdk.devnet.oneledger.network/jsonrpc";
const localURL = "http://127.0.0.1:26602/jsonrpc";

const env = {...defaultEnv, ...{url: localURL}};
const browserEnv = {...defaultEnv, ...{storeConfig: {platform: "browser"}}, ...{url: localURL}};

const txTypesExpect = [
    { TxTypeNum: 1, TxTypeString: 'SEND' },
    { TxTypeNum: 2, TxTypeString: 'SENDPOOL' },
    { TxTypeNum: 17, TxTypeString: 'STAKE' },
    { TxTypeNum: 18, TxTypeString: 'UNSTAKE' },
    { TxTypeNum: 19, TxTypeString: 'WITHDRAW' },
    { TxTypeNum: 33, TxTypeString: 'DOMAIN_CREATE' },
    { TxTypeNum: 34, TxTypeString: 'DOMAIN_UPDATE' },
    { TxTypeNum: 35, TxTypeString: 'DOMAIN_SELL' },
    { TxTypeNum: 36, TxTypeString: 'DOMAIN_PURCHASE' },
    { TxTypeNum: 37, TxTypeString: 'DOMAIN_SEND' },
    { TxTypeNum: 38, TxTypeString: 'DOMAIN_DELETE_SUB' },
    { TxTypeNum: 39, TxTypeString: 'DOMAIN_RENEW' },
    { TxTypeNum: 48, TxTypeString: 'PROPOSAL_CREATE' },
    { TxTypeNum: 49, TxTypeString: 'PROPOSAL_CANCEL' },
    { TxTypeNum: 50, TxTypeString: 'PROPOSAL_FUND' },
    { TxTypeNum: 51, TxTypeString: 'PROPOSAL_VOTE' },
    { TxTypeNum: 52, TxTypeString: 'PROPOSAL_FINALIZE' },
    { TxTypeNum: 53, TxTypeString: 'EXPIRE_VOTES' },
    { TxTypeNum: 54, TxTypeString: 'PROPOSAL_WITHDRAW_FUNDS' },
    { TxTypeNum: 129, TxTypeString: 'BTC_LOCK' },
    { TxTypeNum: 130, TxTypeString: 'BTC_ADD_SIGNATURE' },
    { TxTypeNum: 131, TxTypeString: 'BTC_BROADCAST_SUCCESS' },
    { TxTypeNum: 132, TxTypeString: 'BTC_REPORT_FINALITY_MINT' },
    { TxTypeNum: 133, TxTypeString: 'BTC_EXT_MINT' },
    { TxTypeNum: 134, TxTypeString: 'BTC_REDEEM' },
    { TxTypeNum: 135, TxTypeString: 'BTC_FAILED_BROADCAST_RESET' },
    { TxTypeNum: 145, TxTypeString: 'ETH_LOCK' },
    { TxTypeNum: 146, TxTypeString: 'ETH_REPORT_FINALITY_MINT' },
    { TxTypeNum: 147, TxTypeString: 'ETH_REDEEM' },
    { TxTypeNum: 148, TxTypeString: 'ERC20_LOCK' },
    { TxTypeNum: 149, TxTypeString: 'ERC20_REDEEM' }
];

function removeCreatedTestFiles(fileList) {
    try {
        for (let file of fileList) {
            console.log("remove created test file ", file);
            fs.unlinkSync(file)
        }
    } catch (err) {
        throw Error("failed to remove created test file " + err)
    }
}

module.exports = {
    env,
    browserEnv,
    txTypesExpect,
    removeCreatedTestFiles
};
