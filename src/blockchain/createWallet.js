// REQUIRES: nothing
// RETURNS: encryptedMasterKeySeed

function createWallet() {
  const HDVault = require("hd-vault");
  const { yourMasterKeyPassword } = require("./index");

  const mnemonicWords = HDVault.mnemonicUtil.mnemonicGenerator24();
  const masterKey = new HDVault.MasterKeySeedManager(
    mnemonicWords,
    yourMasterKeyPassword
  );
  const { encryptedMasterKeySeed } = masterKey.getMasterKeySeedInfo();
  return encryptedMasterKeySeed;
}

module.exports = createWallet;
