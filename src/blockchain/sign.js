const {
  keyType,
  keyIndex,
  yourMasterKeyPassword,
  encryptedMasterKeySeed,
} = require("./setup");
const HDVault = require('hd-vault');

async function sign(rawTx) {
  const signData = {
    message: rawTx,
    keyType: keyType,
    keyIndex: keyIndex,
    password: yourMasterKeyPassword,
    encryptedMasterKeySeed: encryptedMasterKeySeed,
  };

  const { response } = await HDVault.derivedKeyManager
    .signTx(signData)
    .catch((error) => {
      throw error;
    });

  const { signature } = response;
  return signature;
}

module.exports = {
  sign
};
