// REQUIRES: rawTx
// RETURNS: signature

async function sign(rawTx) {
const {
  keyType,
  keyIndex,
  yourMasterKeyPassword,
  encryptedMasterKeySeed,
} = require("./requestTestOLT");
const HDVault = require("hd-vault");

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

module.exports = sign;
