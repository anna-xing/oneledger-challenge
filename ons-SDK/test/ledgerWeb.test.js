const webTransport = require("ledger-sdk-web");
const WebUSB = webTransport.LedgerHQ.WebTransport.WebUSB;

const {Ethereum} = require("../ledgerHQ/wallet/ethereum");
const {Oneledger} = require("../ledgerHQ/wallet/Oneledger");
const {Bitcoin} = require("../ledgerHQ/wallet/bitcoin");

// get buttons
const listBtu = document.getElementById("listDevice");
listBtu.onclick = listAndGetDevice;

const createBtu = document.getElementById("createTransport");
createBtu.onclick = createTransport;

const getAddrBtu = document.getElementById("getAddr");
getAddrBtu.onclick = getAddr;

const signTxBtu = document.getElementById("signTransaction");
signTxBtu.onclick = signTx;

const closeBtu = document.getElementById("closeTransport");
closeBtu.onclick = closeTransport;

const walletInTest = "Ethereum";

const wallets = {
    "Oneledger": (transport) => new Oneledger(transport),
    "Ethereum": (transport) => new Ethereum(transport),
    "Bitcoin": (transport) => new Bitcoin(transport),
};

// testcases
function listAndGetDevice() {
    return WebUSB.deviceList().then(deviceList => {
        const {response} = deviceList;
        console.log("devices list: ", response);
        if (response.length > 0) return response[0];
        return []
    }).catch(err => {
        console.log("list device err : ", err);
    })
}

function createTransport() {
    return WebUSB.create().then(transport => {
        const {response} = transport;
        console.log("create WebUSB transport: ", response);
        return response
    }).catch(err => {
        console.log("create WebUSB transport err: ", err);
        return err
    });
}

// make sure you got valid transport before proceed
function getAddr() {
    createTransport().then(transport => {
        console.log("transport to get address:", transport);
        let ledgerHQWallet;
        try {
            ledgerHQWallet = wallets[walletInTest](transport)
        } catch (err) {
            console.log("create wallet err : ", err)
        }
        ledgerHQWallet.getAddrPubKey(1).then(address => {
            console.log("address: ", address);
        }).catch(err => {
            console.log("get address err: ", err);
        })
    }).catch(err => {
        return err
    })
}

function signTx() {
    // const rawTxHex = "0xe8018504e3b292008252089428ee52a8f3d6e5d15f8b131996950d7f296c7952872bd72a2487400080";
    const rawTxHex = "eyJ0eXBlIjozMywiZGF0YSI6ImV5SnZkMjVsY2lJNklqQjROall6TldJMVpXTTROalF4TmpWa00yRTVabVUxT0RKaU5HWmlZalkwWWpoaU1tWTROalV3TWlJc0ltRmpZMjkxYm5RaU9pSXdlRGt3WkROalpEQmhPV05tTjJZM05qZGlPVGt3TVRVNVpqWTJZak5sTURjeFkySXpPREkxWXpVaUxDSnVZVzFsSWpvaWRHVnpkR1J2YldGcGJqSXViMndpTENKaWRYbHBibWRRY21salpTSTZleUpqZFhKeVpXNWplU0k2SWs5TVZDSXNJblpoYkhWbElqb2lNVEF3TVRBd01EQXdNREF3TURBd01EQXdNREF3TUNKOWZRPT0iLCJmZWUiOnsicHJpY2UiOnsiY3VycmVuY3kiOiJPTFQiLCJ2YWx1ZSI6IjEwMDAwMDAwMDAifSwiZ2FzIjo4MDAwMH0sIm1lbW8iOiI5OGNlMDJmMC01ZjI4LTExZWEtYjk4MC01YjMxY2VmNDllMTYifQ==";
    createTransport().then(transport => {
        console.log("transport to get sign tx:", transport);
        let ledgerHQWallet;
        try {
            ledgerHQWallet = wallets[walletInTest](transport)
        } catch (err) {
            console.log("create wallet err : ", err);
        }
        ledgerHQWallet.signTransaction(1, rawTxHex).then(signature => {
            console.log("sign tx signature :", signature);
        }).catch(err => {
            console.log("sign tx signature err :", err);
        });
    }).catch(err => {
        return err
    })
}

function closeTransport() {
    createTransport().then(transport => {
        console.log("transport get: ", transport);
        WebUSB.close(transport).then(ok => {
            console.log("close transport", ok)
        }).catch(err => {
            console.log("failed to close transport: ", err)
        })
    }).catch(err => {
        return err
    })
}
