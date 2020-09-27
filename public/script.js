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

// Loading states
const startLoad = new Event('startLoad');
const finishLoad = new Event('finishLoad');

// Oneledger account initialization
// Generate mnemonic, private key, public key, address
// TODO: ADD id='initAccBtn' to the Get Started btn
const initAccBtn = Document.getElementById('initAccBtn');

initAccBtn.addEventListener('click', async function(e) {
    window.dispatchEvent(startLoad);
    let = await createWallet(yourMasterKeyPassword);
    const emks = temp.encryptedMasterKeySeed;
    const mnemonic = temp.mnemonic;
    const { i, address, publicKey } = await createAccount(yourMasterKeyPassword, emks);
    let response = await requestTestOLT(address);
    setTimeout(async () => {
        let balance = await queryAccount({ address }, env);
        if (balance <= 0) {
            alert('Error: Unable to request OLT');
            return;
        }
        window.dispatchEvent(finishLoad);
    }, 10000);
    return {
        mnemonic: mnemonic,
        encryptedMasterKeySeed: emks,
        publicKey: publicKey,
        address: address
    };
});


