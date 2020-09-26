const request = require("request");

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
    sendRequest
};