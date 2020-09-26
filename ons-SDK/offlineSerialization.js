const base64 = require('Base64');

/**
 * @description Encode json object into base64 string
 * @param obj {Object} any json object
 * @return {string} base64 encoded string
 */
function jsonObjectToBase64(obj) {
    const jsonStr = JSON.stringify(obj);
    return base64.btoa(jsonStr)
}

/**
 * @description Decode base64 string into json object
 * @param str {string} base64 encoded string
 * @return {Object} decoded json object
 */
function base64ToJsonObject(str) {
    return base64.atob(str)
}

module.exports = {
    jsonObjectToBase64,
    base64ToJsonObject
};