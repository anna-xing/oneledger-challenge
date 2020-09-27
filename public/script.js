// Import navbar
$.get("navbar.html", function (data) {
    $("#nav-placeholder").replaceWith(data);
});

// Import blockchain constants + functions
const {
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
  broadcastTx,
} = require("./../src/blockchain/index");

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

// Local storage functions
function localStore(key, val) {
  window.localStorage.setItem(key, JSON.stringify(val));
}
function localGet(key) {
  return JSON.parse(window.localStorage.getItem(key));
}

// Display loading icon based on loading state
// TODO: add id='loadIcon' to loading icon
const loadIcon = Document.getElementById("loadIcon");
window.addEventListener("startLoad", function () {
  loadIcon.classList.remove("hidden");
});
window.addEventListener("finishLoad", function () {
  loadIcon.classList.add("hidden");
});

// Oneledger account initialization
// Generate mnemonic, private key, public key, address
// TODO: ADD id='initAccBtn' to the Get Started btn
const initAccBtn = Document.getElementById("initAccBtn");

initAccBtn.addEventListener("click", async function (e) {
  window.dispatchEvent(startLoad);
  let temp = createWallet(yourMasterKeyPassword);
  const emks = temp.encryptedMasterKeySeed;
  const mnemonic = temp.mnemonic;
  const { i, address, publicKey } = await createAccount(
    yourMasterKeyPassword,
    emks
  );
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

// Allow manufacturers to upload info
// TODO: add id='uploadFormBtn' to the submit btn
//   add appropriate id tags to the form fields
const uploadFormBtn = Document.getElementById("uploadFormBtn");

uploadFormBtn.addEventListener("click", async function (e) {
  window.dispatchEvent("startLoad");
  const vin = Document.getElementById("vin").value.toUpperCase();
  const part = Document.getElementById("part").value.toUpperCase();
  // TODO: how can we standardize the parts??
  const dealerName = Document.getElementById("dealerName").value.toUpperCase();
  const stockNum = Document.getElementById("stockNum").value.toUpperCase();
  const dealerAddr = Document.getElementById("dealerAddr").value.toUpperCase();
  const manufactureYr = parseInt(
    Document.getElementById("manufactureYr").value
  );

  try {
    const address = localGet("address");
    const rawTx = await addPartTxs(
      {
        vin,
        part,
        dealerName,
        dealerAddr,
        stockNum,
        manufactureYr,
        address,
      },
      env
    );
    const emks = localGet("encryptedMasterKeySeed");
    const signature = await sign(rawTx, emks);
    const publicKey = localGet("publicKey");
    await broadcastTx({ publicKey, rawTx, signature }, env);
    maintainBalance(localGet("address"));
    // confirmUpload();
  } catch (err) {
    console.log(err);
    window.dispatchEvent("invalid");
  } finally {
    window.dispatchEvent("finishLoad");
  }
});

// Helper function for maintaining acc balance
async function maintainBalance(addr) {
  let balance = await queryAccount({ addr }, env);
  balance = balance.OLT;
  if (balance <= 0) await requestTestOLT(addr);
}

//----------- in progress --------------------
// Allow end-users to query info
// TODO: add id='queryFormBtn' to the submit query btn, and other ids
const queryFormBtn = Document.getElementById("queryFormBtn");

queryFormBtn.addEventListener("click", async function (e) {
  window.dispatchEvent("startLoad");
  const vin = Document.getElementById("vin").value.toUpperCase();
  const part = Document.getElementById("part").value.toUpperCase();

  try {
    const response = await queryPart({ vin, part }, env);
    const { x, y, dealerName, dealerAddr, stockNum, manufactureYr } = response;
      // TODO: CHANGE THIS ^ B/C IDK THE STRUCTURE OF RESPONSE RIGHT NOW
    // Page redirect to result
    window.location.href = window.location.href + "/Sub-Pages/result.html";
      // 'result.html' == page displaying query result
    Document.getElementById("vin").value = vin;
    Document.getElementById("part").value = part;
    Document.getElementById("dealerName").value = dealerName;
    Document.getElementById("dealerAddr").value = dealerAddr;
    Document.getElementById("stockNum").value = stockNum;
    Document.getElementById("manufactureYr").value = manufactureYr;
  } catch (err) {
    console.log(err);
    window.dispatchEvent("invalid");
  } finally {
    window.dispatchEvent("finishLoad");
  }
});
