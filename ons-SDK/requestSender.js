const request = require("request");

function returnPromise(options) {
  return new Promise((resolve, reject) => {
    sendRequest(options, function (err, response) {
      if (err) return reject(err);
      return resolve(response);
    });
  });
}

function sendRequest(options, callback) {
  request(options, function(error, response, body) {
    if (error || response.body.error || response.statusCode !== 200) {
      callback(
        error || response.body.error || { statusCode: response.statusCode }
      );
      return;
    }
    callback(null, body.result);
  });
}

module.exports = {
  returnPromise
};
