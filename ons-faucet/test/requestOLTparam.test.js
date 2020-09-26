const faucet = require('../main');
const expect = require('chai').expect;

const faucetTestCasesForOneArgvs = [
    {
        name: "test1, should return false with empty address",
        input: "",
        expect: -12000
    },
    {
        name: "test2, should return false with invalid address (short length)",
        input: "0lt123456789012345678901234567890123456789",
        expect: -12001
    },
    {
        name: "test3, should return false with invalid address (not start with 0lt)",
        input: "1234567890123456789012345678901234567890",
        expect: -12001
    },
    {
        name: "test4, should return true with valid address",
        input: "0lt1234567890123456789012345678901234567890",
        expect: true
    },
];

describe('request OLT test for js module for only address', function () {
    while (faucetTestCasesForOneArgvs.length > 0) {
        const testcase = faucetTestCasesForOneArgvs.shift();
        it(testcase.name, async function () {
            const result = await faucet.requestOLT(testcase.input).catch(err => {
                console.log("REJ", err);
                expect(err.error.code).equals(testcase.expect);
            });
            if (typeof result !== "undefined") {
                console.log("re", result);
                expect(result.response.result).equals(testcase.expect);
            }
        });
    }
});

const faucetTestCasesForTwoArgv = [
    {
        name: "test5, should return false, address is valid, but function only accept one param now",
        input: "0ltdaa626ae1ccf83b1d399f3c7e73d39453a4c6f10",
        input2: "",
        expect: -10004
    },
    {
        name: "test6, should return false with empty address",
        input: null,
        input2: null,
        expect: -12000
    },
    {
        name: "test7, should return true with valid address and default amount",
        input: "0ltdaa626ae1ccf83b1d399f3c7e73d39453a4c6f10",
        input2: undefined,
        expect: true
    },
    {
        name: "test8, should return true with valid address",
        input: "0ltAaa626ae1ccf83b1d399f3c7e73d39453a4c6f10",
        input2: 100,
        expect: true
    },
    {
        name: "test8, should return true with valid address",
        input: "0ltAaa626ae1ccf83b1d399f3c7e73d39453a4c6f10",
        input2: 100,
        expect: true
    }
];

describe('request OLT test for js module for address and amount', function () {
    while (faucetTestCasesForTwoArgv.length > 0) {
        const testcase = faucetTestCasesForTwoArgv.shift();
        it(testcase.name, async function () {
            const result = await faucet.requestOLT(testcase.input, testcase.input2).catch(err => {
                console.log("REJ", err);
                expect(err.error.code).equals(testcase.expect);
            });
            if (typeof result !== "undefined") {
                console.log("re", result);
                expect(result.response.result).equals(testcase.expect);
            }
        });
    }
});

const faucetTestCasesForAllArgv = [
    {
        name: "test9, should return error, env object is invalid",
        input: "0ltdaa626ae1ccf83b1d399f3c7e73d39453a4c6f10",
        input2: "",
        input3: {url: ""},
        expect: -10004
    },
    {
        name: "test10, should return true using default amount and default env",
        input: "0ltdaa626ae1ccf83b1d399f3c7e73d39453a4c6f10",
        input2: undefined,
        input3: {ABC: ""},
        expect: true
    },
    {
        name: "test11, should return true with valid address and new url",
        input: "0ltdaa626ae1ccf83b1d399f3c7e73d39453a4c6f10",
        input2: 100,
        input3: {url: "http://127.0.0.1:65432/jsonrpc"},
        expect: true
    },
    {
        name: "test12, should return true with valid address and default env",
        input: "0ltAaa626ae1ccf83b1d399f3c7e73d39453a4c6f10",
        input2: 100,
        input3: undefined,
        expect: true
    },
    {
        name: "test13, should return true with valid address and default env",
        input: "0ltAaa626ae1ccf83b1d399f3c7e73d39453a4c6f10",
        input2: 100,
        input3: {a: "a", b: 1},
        expect: true
    },
    {
        name: "test14, should return error with valid address and invalid env url",
        input: "0ltAaa626ae1ccf83b1d399f3c7e73d39453a4c6f10",
        input2: 100,
        input3: {a: "a", b: 1, url: "123.123.123"},
        expect: -12005
    },
    {
        name: "test15, should return error with valid address and invalid env url",
        input: "0ltAaa626ae1ccf83b1d399f3c7e73d39453a4c6f10",
        input2: 100,
        input3: {a: "a", b: 1, url: 123},
        expect: -12005
    }
];

describe('request OLT test for js module for address and amount and env object', function () {
    while (faucetTestCasesForAllArgv.length > 0) {
        const testcase = faucetTestCasesForAllArgv.shift();
        it(testcase.name, async function () {
            const result = await faucet.requestOLT(testcase.input, testcase.input2, testcase.input3).catch(err => {
                console.log("REJ", err);
                expect(err.error.code).equals(testcase.expect);
            });
            if (typeof result !== "undefined") {
                console.log("re", result);
                expect(result.response.result).equals(testcase.expect);
            }
        });
    }
});

