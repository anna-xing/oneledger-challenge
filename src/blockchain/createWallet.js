// REQUIRES: yourMasterKeyPassword
// RETURNS: { encryptedMasterKeySeed, mnemonicWords }

function createWallet(yourMasterKeyPassword) {
  const HDVault = require("hd-vault");

  const mnemonicWords = HDVault.mnemonicUtil.mnemonicGenerator24();
  const masterKey = new HDVault.MasterKeySeedManager(
    mnemonicWords,
    yourMasterKeyPassword
  );
  const { encryptedMasterKeySeed } = masterKey.getMasterKeySeedInfo();
  return {
    encryptedMasterKeySeed: encryptedMasterKeySeed,
    mnemonic: mnemonicWords
  };
}

module.exports = createWallet;
