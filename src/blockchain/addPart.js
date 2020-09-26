const addPartTxType = "990201";

const { isInteger, isPositiveInteger, isValidStr } = require("explorer-sdk-js");
const { requestErrors } = require("middle_utility/errorHandler/errorType");
const { request, util, offlineSerialize } = require("ons-SDK");
const { ErrorUtil } = require("middle_utility").TierError;

function isValidStrLen(str, len) {
  return isValidStr(str) && str.length === len;
}

// throws InvalidArgument if bad args
async function addPartTx({vin, partType, dealerName, dealerAddress,
    stockNum, year, operator, gasAdjustment = 0}, env) {
  // input check
  if (
    !isValidStrLen(vin, 17) ||
    !isValidStrLen(stockNum, 9) ||
    !isInteger(year) ||
    !isPositiveInteger(year)
  ) {
    throw requestErrors.InvalidArgument;
  }

  // query current gas price from Oneledger network
  let gasPrice;
  try {
    const result = await request.queryGasPrice(env);
    gasPrice = result.response;
  } catch (err) {
    return Promise.reject(err);
  }

  // construct customized transaction data
  const txData = {
    VIN: vin,
    "Part Type": partType,
    "Dealer Name": dealerName,
    "Dealer Address": dealerAddress,
    "Stock Number": stockNum,
    "Year of Manufacture": year,
    Operator: operator,
  };

  const assembledTx = util.assembleTxData(
    addPartTxType,
    txData,
    gasPrice,
    gasAdjustment
  );
  assembledTx.fee.gas = 1000;
  const { gas } = assembledTx.fee;
  const feeEstimationResult = await util
    .txFeeEstimator(gas, gasPrice)
    .catch((error) => {
      return Promise.reject(error);
    });
  return Promise.resolve(
    ErrorUtil.responseWrap({
      ...util.rawTxStructure(offlineSerialize.jsonObjectToBase64(assembledTx)),
      ...{ feeEstimation: feeEstimationResult.response },
    })
  );
}

module.exports = {
  addPartTx,
};
