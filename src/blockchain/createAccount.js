// REQUIRES: yourMasterKeyPassword, encryptedMasterKeySeed
// RETURNS: response = { keyIndex, address, publicKey }

async function createAccount(yourMasterKeyPassword, encryptedMasterKeySeed) {
  const { keyType } = require("./index");
  const HDVault = require('hd-vault');

  const derivedKeyData = {
    keyType: keyType,
    keyIndex: 0, // Increment keyIndex for generating new keys
    password: yourMasterKeyPassword,
    encryptedMasterKeySeed: encryptedMasterKeySeed,
  };

  const { response } = await HDVault.derivedKeyManager
    .deriveNewKeyPair(derivedKeyData)
    .catch((error) => {
      throw error;
    });
 
  return response;
}

module.exports = createAccount;
