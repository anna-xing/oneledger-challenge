// REQUIRES: yourMasterKeyPassword, encryptedMasterKeySeed
// RETURNS: { address, publicKey }

async function createAccount(yourMasterKeyPassword, encryptedMasterKeySeed) {
  const { keyType, keyIndex } = require("./index");
  const HDVault = require('hd-vault');

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

module.exports = createAccount;
