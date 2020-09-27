/* OTHER STUFF TO FINISH:
    - confirmUpload(): indicates that the upload has been successful
    - EventListeners for components which indicate invalid input
    - EventListeners for components which indicate account errors
*/

// Errors
// TODO: attach EventListeners to components that respond to errors
const accountError = new Event("accountError");
// For account-related errors, e.g. balance too low

// Loading states
const startLoad = new Event("startLoad");
const finishLoad = new Event("finishLoad");

// Oneledger account initialization
// Generate mnemonic, private key, public key, address
// TODO: ADD id='initAccBtn' to the Get Started btn
const initAccBtn = document.getElementById("initAccBtn");

console.log(initAccBtn);

initAccBtn.addEventListener("click", async function (e) {
  window.dispatchEvent(startLoad);
  let temp = createWallet(yourMasterKeyPassword);
  const emks = temp.encryptedMasterKeySeed;
  const mnemonic = temp.mnemonic;
  const { i, address, publicKey } = await createAccount(
    yourMasterKeyPassword,
    emks
  );
  console.log(temp);
  console.log('HELLO')
  await requestTestOLT(address);
  setTimeout(async () => {
    let balance = await queryAccount({ address }, env);
    if (balance <= 0) {
      window.dispatchEvent(accountError);
      return;
    }
    window.dispatchEvent(finishLoad);
  }, 10000);

  localStore("mnemonic", mnemonic);
  localStore("encryptedMasterKeySeed", emks);
  localStore("publicKey", publicKey);
  localStore("address", address);
});


