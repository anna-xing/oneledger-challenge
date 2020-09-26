// check if a string is either undefined, "", null or "<nil>", if so return false
function isValidString(str) {
    return !(typeof str === "undefined" || str === "" || str === "<nil>" || str === null)
}

// check if OLT address is valid, if so, return true
function isValidOLTAddress(addr) {
    return !(!isValidString(addr) || !addr.startsWith("0lt") || addr.length !== 43);
}

// check if input is a positive Integer
function isPositiveInteger(num) {
    if (!Number(num) || num <= 0) return false;
    const strNum = num.toString();
    return strNum.indexOf(".") === -1
}

module.exports = {
    isValidString,
    isValidOLTAddress,
    isPositiveInteger
};
