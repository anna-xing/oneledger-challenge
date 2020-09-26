const yourMasterKeyPassword = "5h$mY_SupEr_sTRong_%$passWorD123#@";
const fullnodeUrl = "https://comm-test-fn1.devnet.oneledger.network/jsonrpc";
const faucetServerUrl =
  "https://comm-test-faucet.devnet.oneledger.network/jsonrpc";
const keyType = "OLT";
const keyIndex = 0;
const HDVault = require("hd-vault");

function createWallet() {
  // 1. Create HD Wallet
  const mnemonicWords = HDVault.mnemonicUtil.mnemonicGenerator24();
  const masterKey = new HDVault.MasterKeySeedManager(
    mnemonicWords,
    yourMasterKeyPassword
  );
  const { encryptedMasterKeySeed } = masterKey.getMasterKeySeedInfo();
  return encryptedMasterKeySeed;
}

const encryptedMasterKeySeed = createWallet();

async function createAccount(encryptedMasterKeySeed) {
  // 2. Create Oneledger Account
  const derivedKeyData = {
    keyType: keyType,
    keyIndex: keyIndex, // Increment keyIndex for generating new keys
    password: yourMasterKeyPassword,
    encryptedMasterKeySeed: encryptedMasterKeySeed,
  };

  const { response } = await HDVault.derivedKeyManager
    .deriveNewKeyPair(derivedKeyData)
    .catch((error) => {
      throw error;
    });

  const { temp, address, publicKey } = response;
  return { address, publicKey };
}

const { address, publicKey } = createAccount(encryptedMasterKeySeed);

async function requestTestOLT(address, publicKey, encryptedMasterKeySeed) {
  // 3. Request Test OLT
  const requestAmount = 10000;
  const faucet = require("ons-faucet");
  const env = { url: "https://cors-anywhere.herokuapp.com/" + faucetServerUrl };
  const { response } = await faucet
    .requestOLT(address, requestAmount, env)
    .catch((error) => {
      throw error;
    });
  return response;
}

// Defining env

const env = {
  url: fullnodeUrl,
  storeConfig: {
    platform: "browser",
    storeLocation: __dirname,
  },
};

module.exports = {
  yourMasterKeyPassword,
  keyType,
  keyIndex,
  publicKey,
  encryptedMasterKeySeed,
  env,
  createWallet,
  createAccount,
  requestTestOLT,
};
