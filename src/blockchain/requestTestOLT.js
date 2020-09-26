// REQUIRES: address
// RETURNS: response

async function requestTestOLT(address) {
  const faucet = require('ons-faucet');
  const { faucetServerUrl } = require('./index');

  const requestAmount = 10000;
  const env = { url: "https://cors-anywhere.herokuapp.com/" + faucetServerUrl };
  const { response } = await faucet
    .requestOLT(address, requestAmount, env)
    .catch((error) => {
      throw error;
    });

  return response;
}

module.exports = requestTestOLT;
