const RPC = require("./requestRPC");

const headers = {
    "Content-Type": "application/json",
    Accept: "application/json"
};
const method = "POST";
const body = { jsonrpc: "2.0", method: "", id: 1 };
const json = true;

const options = {
    method: method,
    headers: headers,
    body: body,
    json: json,
    timeout: 3000
};

function requestOLT({ address, amount, url }){
    let reqOlt = {
        address : address,
        amount : amount
    };
    body["params"] = reqOlt;
    options["url"] = url;
    body.method = "faucet.RequestOLT";
    return returnPromise(options);
}

function returnPromise(options) {
    return new Promise((resolve, reject) => {
        RPC.sendRequest(options, function(err, response) {
            if (err) return reject(err);
            resolve(response);
        });
    });
}

module.exports = {
    requestOLT
};