const nodeTransport = require("ledger-sdk-node");
const NodeHid = nodeTransport.LedgerHQ.NodeTransport.NodeHid;

const {Oneledger} = require("../ledgerHQ/wallet/oneledger");
const {Ethereum} = require("../ledgerHQ/wallet/ethereum");
const {Bitcoin} = require("../ledgerHQ/wallet/bitcoin");

const walletInUse = "Ethereum";
const wallets = {
    "Oneledger" : (transport) => new Oneledger(transport),
    "Ethereum" : (transport) => new Ethereum(transport),
    "Bitcoin" : (transport) => new Bitcoin(transport)
};

describe("Ledger node HID transport test", () => {
    it('test1, list all devices', async () => {
        const list = await NodeHid.deviceList().catch(err => {
            console.log("device list err ", err);
        });
        console.log("device list ", list)
    });
    it('test2, create transport', async () => {
        const transport = await NodeHid.create().catch(err => {
            console.log("create transport err ", err)
        });
        console.log("transport creation result ", transport)
    });
    it('test3, get address and pubkey', async () => {
        const transport = await NodeHid.create().catch(err => {
            console.log("create transport err ", err)
        });
        const {response} = transport;
        if (typeof response === "undefined") return;
        let wallet;
        try {
            wallet = wallets[walletInUse](response)
        } catch (err) {
            console.log("connect to wallet err ", err);
            return
        }
        const repo = await wallet.getAddrPubKey(1).catch(err => {
            console.log("fetch address and pubkey err " , err)
        });
        const {address, publicKey} = repo.response;
        console.log("address ", address);
        console.log("publicKey ", publicKey)
    }).timeout(200000);
    it('test4, sign tx', async () => {
        const transport = await NodeHid.create().catch(err => {
            console.log("create transport err ", err)
        });
        const {response} = transport;
        if (typeof response === "undefined") return;
        let wallet;
        try {
            wallet = wallets[walletInUse](response)
        } catch (err) {
            console.log("connect to wallet err ", err);
            return
        }
        const rawTxHex = "eyJ0eXBlIjozMywiZGF0YSI6ImV5SnZkMjVsY2lJNklqQjROall6TldJMVpXTTROalF4TmpWa00yRTVabVUxT0RKaU5HWmlZalkwWWpoaU1tWTROalV3TWlJc0ltRmpZMjkxYm5RaU9pSXdlRGt3WkROalpEQmhPV05tTjJZM05qZGlPVGt3TVRVNVpqWTJZak5sTURjeFkySXpPREkxWXpVaUxDSnVZVzFsSWpvaWRHVnpkR1J2YldGcGJqSXViMndpTENKaWRYbHBibWRRY21salpTSTZleUpqZFhKeVpXNWplU0k2SWs5TVZDSXNJblpoYkhWbElqb2lNVEF3TVRBd01EQXdNREF3TURBd01EQXdNREF3TUNKOWZRPT0iLCJmZWUiOnsicHJpY2UiOnsiY3VycmVuY3kiOiJPTFQiLCJ2YWx1ZSI6IjEwMDAwMDAwMDAifSwiZ2FzIjo4MDAwMH0sIm1lbW8iOiI5OGNlMDJmMC01ZjI4LTExZWEtYjk4MC01YjMxY2VmNDllMTYifQ==";
        const repo = await wallet.signTransaction(1, rawTxHex).catch(err => {
            console.log("sign tx err ", err)
        });
        const {signature} = repo.response;
        console.log("signature ", signature);
    }).timeout(200000);
    it('test5, close transport', async () => {
        const transport = await NodeHid.create().catch(err => {
            console.log("create transport err ", err)
        });
        const {response} = transport;
        const closeRe = await NodeHid.close(response).catch(err => {
            console.log("close transport err ", err)
        });
        console.log("close transport result ", closeRe);
    })
});


