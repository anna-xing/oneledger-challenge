const {request} = require('ons-SDK');

async function queryBalanceForAddr({address, currency}, env) {
    const queryBalanceObj = {
        address: address,
        currency: currency
    };

    const {response} = await request.queryCurrencyBalanceForAccount(queryBalanceObj, env).catch(error => {
        throw error;
    });
    const balance = response;
}

module.exports = {
    queryBalanceForAddr
}
