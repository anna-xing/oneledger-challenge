const request = require("../main");
const expect = require('chai').expect;
const chai = require('chai');
const requestSender = require("../requestSender");
const sinon = require('sinon');
const sinonChai = require("sinon-chai");

chai.use(sinonChai);

const queryAccountInfoTestcases = [
    {
        name: "test1, no address given",
        input: undefined,
        expect: -10000
    },
    {
        name: "test2, short invalid address given",
        input: "12312312312312312",
        expect: -10000
    },
    {
        name: "test3, valid address given",
        input: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        expect: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4"
    },
    {
        name: "test4, valid address given with invalid env object",
        input: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        input2: {a: 1, b: 2},
        expect: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4"
    },
    {
        name: "test5, valid address given with invalid env object",
        input: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        input2: {a: 1, b: 2, url: 123},
        expect: -12005
    }
];

describe("test query account info", function () {
    queryAccountInfoTestcases.forEach(function (testcase) {
        it(testcase.name, async function () {
            const re = await request.account.queryAccountInfo(testcase.input, testcase.input2).catch(err => {
                console.log("err", err);
                expect(err.error.code).to.equals(testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log("re", re);
                expect(re.response.key).to.equals(testcase.expect)
            }
        });
    })
});

const queryAccountTxsTestcases = [
    {
        name: "test1, valid address given with invalid page number",
        inputEnv: undefined,
        inputAddress: "0lt1234567890123456789012345678901234567890",
        inputPage: -1,
        inputPageSize: 1,
        expect: -10012
    },
    {
        name: "test2, valid address given with valid large page number",
        inputEnv: undefined,
        inputAddress: "0lt1234567890123456789012345678901234567890",
        inputPage: 2100045,
        inputPageSize: 1,
        expect: ""
    },
    {
        name: "test3, valid address given with invalid page number",
        inputEnv: undefined,
        inputAddress: "0lt1234567890123456789012345678901234567890",
        inputPage: "-1",
        inputPageSize: 1,
        expect: -10012
    },
    {
        name: "test4, no address given with no page number given",
        inputEnv: undefined,
        inputAddress: undefined,
        inputPage: undefined,
        inputPageSize: 1,
        expect: -10000
    },
    {
        name: "test5, valid address given",
        inputEnv: undefined,
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        inputPage: 0,
        inputPageSize: 1,
        expect: ""
    },
    {
        name: "test6, get applyvalidator tx",
        inputEnv: undefined,
        inputAddress: "0lt4d64294d1178d0c3c1f87f33b2875950a09729ff",
        inputPage: 0,
        inputPageSize: 1,
        expect: ""
    },
    {
        name: "test7, get withdraw tx",
        inputEnv: undefined,
        inputAddress: "0lte764a9b60ccb1b2d79e45adee0d66d26a429c423",
        inputPage: 0,
        inputPageSize: 1,
        expect: ""
    },
    {
        name: "test8, valid address with invalid env",
        inputEnv: {url: "127.0.0.1:8080"},
        inputAddress: "0lte764a9b60ccb1b2d79e45adee0d66d26a429c423",
        inputPage: 0,
        inputPageSize: 1,
        expect: -12005
    },
    {
        name: "test9, valid address with invalid env",
        inputEnv: {URL: "http://127.0.0.1:8080"},
        inputAddress: "0lte764a9b60ccb1b2d79e45adee0d66d26a429c423",
        inputPage: 0,
        inputPageSize: 1,
        expect: ""
    },
    {
        name: "test10, valid address with valid env",
        inputEnv: {url: "http://127.0.0.1:8080"},
        inputAddress: "0lte764a9b60ccb1b2d79e45adee0d66d26a429c423",
        inputPage: 0,
        inputPageSize: 1,
        expect: ""
    },
    {
        name: "test11, valid address with valid env but no nextPageStartIndex provided",
        inputEnv: {url: "http://127.0.0.1:8080"},
        inputAddress: "0lte764a9b60ccb1b2d79e45adee0d66d26a429c423",
        inputPage: undefined,
        inputPageSize: 1,
        expect: ""
    },
    {
        name: "test12, valid address only",
        inputAddress: "0lte764a9b60ccb1b2d79e45adee0d66d26a429c423",
        expect: ""
    },
    {
        name: "test13, valid address with valid env only",
        inputAddress: "0lte764a9b60ccb1b2d79e45adee0d66d26a429c423",
        expect: ""
    },
    {
        name: "test14, valid address with valid env",
        inputEnv: {url: "http://127.0.0.1:8080"},
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        inputPage: 0,
        expect: ""
    },
    {
        name: "test15, valid address with valid env, empty page and empty pageSize, return first page and using default pageSize",
        inputEnv: {url: "http://127.0.0.1:8080"},
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        inputPage: undefined,
        inputPageSize: undefined,
        expect: ""
    },
    {
        name: "test16, valid address with valid env, empty page and non empty pageSize, return first page and pageSize",
        inputEnv: {url: "http://127.0.0.1:8080"},
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        inputPage: undefined,
        inputPageSize: 2,
        expect: ""
    },
    {
        name: "test17, valid address with valid env, non empty page and empty pageSize, return specific page and using default pageSize",
        inputEnv: {url: "http://127.0.0.1:8080"},
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        inputPage: 1,
        inputPageSize: null,
        expect: ""
    },
    {
        name: "test18, valid address with valid env, empty page and non empty pageSize, return specific page and using default pageSize",
        inputEnv: {url: "http://127.0.0.1:8080"},
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        inputPage: "",
        inputPageSize: 2,
        expect: ""
    },
    {
        name: "test19, valid address with valid env, empty page and non empty pageSize, return specific page and using default pageSize",
        inputEnv: {url: "http://127.0.0.1:8080"},
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        inputPage: 1,
        inputPageSize: "",
        expect: ""
    },
    {
        name: "test20, valid address with valid env, empty page and non empty pageSize, return specific page and using default pageSize with invalid currency",
        inputEnv: {url: "http://127.0.0.1:8080"},
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        inputPage: 1,
        inputPageSize: "",
        currency: "abc",
        expect: -12029
    },
];

describe("test query account txs", function () {
    queryAccountTxsTestcases.forEach(function (testcase) {
        it(testcase.name, async function () {
            const data = {
                address: testcase.inputAddress,
                page: testcase.inputPage,
                pageSize: testcase.inputPageSize
            };
            if (typeof testcase.currency != "undefined") {
                data["currency"] = testcase.currency
            }
            const re = await request.account.queryAccountTxs(data, testcase.inputEnv).catch(err => {
                console.log("err", err);
                expect(err.error.code).to.equals(testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log("parsed txs : ", re);
                expect(re.response).to.exist
            }
        }).timeout(10000);
    })
});

const currencyParamTestcases = [
    {
        name: "test1, valid address with valid env, non empty page and non empty pageSize and currency, return specific page and using default pageSize",
        inputEnv: {url: "http://127.0.0.1:8080"},
        inputData: {
            address: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            page: 0,
            pageSize: 10,
            currency: "ETH",
        },
        requestSenderCalledWith: {
            method: 'GET',
            timeout: 5000,
            url:
                'http://127.0.0.1:8080/accounts/0lt52901e9603f9d504049c9d79132e3e9c2820b6a4/txs?page=0&pagesize=10&currency=eth'
        },
        expect: Promise.resolve("{\"txs\":[],\"totalPage\":0}\n")
    },
    {
        name: "test2, valid address with valid env, non empty page and non empty pageSize and currency, return specific page and using default pageSize",
        inputEnv: {url: "http://127.0.0.1:8080"},
        inputData: {
            address: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            page: 0,
            pageSize: 10,
            currency: "BTC",
        },
        requestSenderCalledWith: {
            method: 'GET',
            timeout: 5000,
            url:
                'http://127.0.0.1:8080/accounts/0lt52901e9603f9d504049c9d79132e3e9c2820b6a4/txs?page=0&pagesize=10&currency=btc'
        },
        expect: Promise.resolve("{\"txs\":[],\"totalPage\":0}\n")
    },
    {
        name: "test3, valid address with valid env, non empty page and non empty pageSize and currency, return specific page and using default pageSize",
        inputEnv: {url: "http://127.0.0.1:8080"},
        inputData: {
            address: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            page: 0,
            pageSize: 10,
            currency: "olt",
        },
        requestSenderCalledWith: {
            method: 'GET',
            timeout: 5000,
            url:
                'http://127.0.0.1:8080/accounts/0lt52901e9603f9d504049c9d79132e3e9c2820b6a4/txs?page=0&pagesize=10&currency=olt'
        },
        expect: Promise.resolve("{\"txs\":[],\"totalPage\":0}\n")
    }
];

describe("test query account txs with currency", function () {
    let stub;
    beforeEach(() => {
        stub = sinon.stub(requestSender, "returnPromise")
    })
    for (let i = 0; i < currencyParamTestcases.length; i++) {
        it(currencyParamTestcases[i].name, async function () {
            stub.returns(currencyParamTestcases[i].expect)
            await request.account.queryAccountTxs(currencyParamTestcases[i].inputData, currencyParamTestcases[i].inputEnv)
            sinon.assert.calledWith(stub, currencyParamTestcases[i].requestSenderCalledWith)
        })
    }
    afterEach(() => {
        stub.restore()
    })
});

