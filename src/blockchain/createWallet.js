// REQUIRES: yourMasterKeyPassword
// RETURNS: encryptedMasterKeySeed

function createWallet(yourMasterKeyPassword) {
  const HDVault = require("hd-vault");

  const mnemonicWords = HDVault.mnemonicUtil.mnemonicGenerator24();
  const masterKey = new HDVault.MasterKeySeedManager(
    mnemonicWords,
    yourMasterKeyPassword
  );
  const { encryptedMasterKeySeed } = masterKey.getMasterKeySeedInfo();
  return encryptedMasterKeySeed;
}

module.exports = createWallet;
