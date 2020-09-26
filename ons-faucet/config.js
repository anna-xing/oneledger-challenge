// for chronos
const chronosURL = {
    url: "https://faucet.chronos.oneledger.network",
    path: "/jsonrpc"
};

// for devnet
const devnetURL = {
    url: "https://faucet.devnet.oneledger.network",
    path: "/jsonrpc"
};

// for local
const localURL = {
    url: "http://127.0.0.1:65432",
    path: "/jsonrpc"
};

const defaultEnv = {
    url: chronosURL.url + chronosURL.path
};

module.exports = {
    defaultEnv
};
