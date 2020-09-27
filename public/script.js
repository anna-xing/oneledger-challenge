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
    broadcastTx
} = require('./../src/blockchain/index');

// Errors
// TODO: attach EventListeners to components that respond to errors
const accountError = new Event('accountError'); 
  // For account-related errors, e.g. balance too low

// Loading states
const startLoad = new Event('startLoad');
const finishLoad = new Event('finishLoad');

// Local storage functions
function localStore(key, val) {
    window.localStorage.setItem(key, JSON.stringify(val));
}
function localGet(key) {
    return JSON.parse(window.localStorage.getItem(key));
}

// Display loading icon based on loading state
// TODO: add id='loadIcon' to loading icon
const loadIcon = Document.getElementById('loadIcon')
window.addEventListener('startLoad', function() {
    loadIcon.classList.remove('hidden');
})
window.addEventListener('finishLoad', function() {
    loadIcon.classList.add('hidden');
})

// Oneledger account initialization
// Generate mnemonic, private key, public key, address
// TODO: ADD id='initAccBtn' to the Get Started btn
const initAccBtn = Document.getElementById('initAccBtn');

initAccBtn.addEventListener('click', async function(e) {
    window.dispatchEvent(startLoad);
    let temp = createWallet(yourMasterKeyPassword);
    const emks = temp.encryptedMasterKeySeed;
    const mnemonic = temp.mnemonic;
    const { i, address, publicKey } = await createAccount(yourMasterKeyPassword, emks);
    await requestTestOLT(address);
    setTimeout(async () => {
        let balance = await queryAccount({ address }, env);
        if (balance <= 0) {
            window.dispatchEvent(accountError);
            return;
        }
        window.dispatchEvent(finishLoad);
    }, 10000);

    localStore('mnemonic', mnemonic);
    localStore('encryptedMasterKeySeed', emks);
    localStore('publicKey', publicKey);
    localStore('address', address);
});

// Allow manufacturers to upload info
// TODO: add id='uploadFormBtn' to the submit btn
//   add appropriate id tags to the form fields
const uploadFormBtn = Document.getElementById('uploadFormBtn');

uploadFormBtn.addEventListener('click', async function(e) {
    window.dispatchEvent('startLoad');
    const vals = {
        vin: Document.getElementById('vin').value.toUpperCase(),
        part: Document.getElementById('part').value.toUpperCase(),
            // TODO: how can we standardize the parts??
        dealerName: Document.getElementById('dealerName').value.toUpperCase(),
        stockNum: Document.getElementById('stockNum').value.toUpperCase(),
        dealerAddr: Document.getElementById('dealerAddr').value.toUpperCase(),
        manufactureYr: parseInt(Document.getElementById('manufactureYr').value)
    }

    // Input validation
    let tempVals = Object.values(vals);
    for (x in tempVals) {
        if (x === NaN || x === undefined || x === null) {
            window.dispatchEvent('invalid');
            return;
        }
    }
    
    try {
        const address = localGet('address');
        const rawTx = await addPartTxs({
            vin, part, dealerName, dealerAddr, 
            stockNum, manufactureYr, address}, env);
        const emks = localGet('encryptedMasterKeySeed');
        const signature = await sign(rawTx, emks);
        const publicKey = localGet('publicKey');
        const txHash = await broadcastTx({
            publicKey, rawTx, signature}, env);
    } catch {
        window.dispatchEvent('invalid');
    } finally {
        window.dispatchEvent('finishLoad');
    }

    maintainBalance(localGet('address'));
})

// Helper function for maintaining account balance
async function maintainBalance(addr) {
    let balance = await queryAccount({addr}, env);
    balance = balance.OLT;
    if (balance <= 0) await requestTestOLT(addr);
}

//----------- in progress --------------------
// Allow end-users to query info
// TODO: add id='
const queryFormBtn = Document.getElementById('queryFormBtn');

queryFormBtn.addEventListener('click', async function(e) {
    window.dispatchEvent('startLoad');
    const vals = {

    }
})
