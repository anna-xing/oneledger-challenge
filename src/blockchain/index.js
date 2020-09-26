const yourMasterKeyPassword = "newpassword";
const fullnodeUrl = "https://comm-test-fn1.devnet.oneledger.network/jsonrpc";
const faucetServerUrl =
  "https://comm-test-faucet.devnet.oneledger.network/jsonrpc";
const keyType = "OLT";
const keyIndex = 0;
const env = {
  url: fullnodeUrl,
  storeConfig: {
    platform: "browser",
    storeLocation: __dirname,
  },
};

const createWallet = require('./createWallet');
const createAccount = require('./createAccount');
const requestTestOLT = require('./requestTestOLT');
const addPartTx = require('./addPart');
const queryPart = require('./queryPart');
const queryAccount = require('./queryAccount');
const sign = require('./sign');
const broadcastTx = require('./broadcast');

module.exports = {
    yourMasterKeyPassword,
    fullnodeUrl,
    faucetServerUrl,
    keyType,
    keyIndex,
    env,
    createWallet,
    createAccount,
    requestTestOLT,
    addPartTx,
    queryPart,
    queryAccount,
    sign,
    broadcastTx
}