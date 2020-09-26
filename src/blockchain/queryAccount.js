// REQUIRES: {address, currency}, env
// RETURNS: response

async function queryAccount({ address, currency }, env) {
  const { request } = require("ons-SDK");

  const queryBalanceObj = {
    address: address,
    currency: currency,
  };

  const { response } = await request
    .queryCurrencyBalanceForAccount(queryBalanceObj, env)
    .catch((error) => {
      throw error;
    });

  return response;
}

module.exports = queryAccount;
