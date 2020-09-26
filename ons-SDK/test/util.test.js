const util = require('../util');
const expect = require('chai').expect;
const should = require('should');
const fs = require("fs");
const {env} = require('./testUtil')

function removeCreatedTestFiles(fileList) {
    try {
        for (let file of fileList) {
            console.log("remove created test file ", file);
            fs.unlinkSync(file)
        }
    } catch (err) {
        throw Error("failed to remove created test file " + err)
    }
}

const priceParseTestCases = [
    {
        name: "1,should return 0.0",
        input: {amount: "", decimal: 10},
        expect: ""
    },
    {
        name: "2,should return 0.0",
        input: {amount: undefined, decimal: 10},
        expect: ""
    },
    {
        name: "3,should return 0.0",
        input: {amount: "<nil>", decimal: 10},
        expect: ""
    },
    {
        name: "4,should return 0.123456789",
        input: {amount: "1234567890", decimal: 10},
        expect: "0.123456789"
    },
    {
        name: "5.should return 0.0",
        input: {amount: "12345678900000", decimal: ""},
        expect: ""
    },
    {
        name: "6.should return 0.0",
        input: {amount: "12345678900000", decimal: "<nil>"},
        expect: ""
    },
    {
        name: "7.should return 1234.56789",
        input: {amount: "12345678900000", decimal: 10},
        expect: "1234.56789"
    },
    {
        name: "8.should return 1234567.89",
        input: {amount: "1234567890000000000000", decimal: 15},
        expect: "1234567.89"
    },
    {
        name: "9.should return 0.0",
        input: {amount: "1234567890000000000000", decimal: undefined},
        expect: ""
    },
    {
        name: "10.should return 123456789000000000000",
        input: {amount: "1234567890000000000000", decimal: 1},
        expect: "123456789000000000000"
    },
    {
        name: "11.should return 12345678900000",
        input: {amount: "12345678900000000000000000000", decimal: 15},
        expect: "12345678900000"
    },
    {
        name: "12.should return 1234567.89",
        input: {amount: "12345678900000000000000000000", decimal: 22},
        expect: "1234567.89"
    },
    {
        name: "13.should return 0.0123456789",
        input: {amount: "12345678900000000000000000000", decimal: 30},
        expect: "0.0123456789"
    },
    {
        name: "14.should return 0.0, invalid number, two dots",
        input: {amount: "12345.67890000.00000123450000", decimal: 30},
        expect: ""
    },
    {
        name: "15.should return 12340000000.0000000001",
        input: {amount: "123400000000000000001", decimal: 10},
        expect: "12340000000.0000000001"
    },
    {
        name: "16.should return 123456789000000000",
        input: {amount: "1234567890000000000000", decimal: 4},
        expect: "123456789000000000"
    },
    {
        name: "17.should return 10000",
        input: {amount: "10000000000000000000000", decimal: 18},
        expect: "10000"
    },
    {
        name: "18.should return 10000",
        input: {amount: ".102340005678000000", decimal: 18},
        expect: ""
    },
];

describe("price calculator test", function () {
    for (let i = 0; i < priceParseTestCases.length; i++) {
        it(priceParseTestCases[i].name, function () {
            const result = util.responsePriceConverter(priceParseTestCases[i].input.amount, priceParseTestCases[i].input.decimal);
            console.log(result);
            expect(result).equals(priceParseTestCases[i].expect)
        })
    }
});

const inputPriceConvertTestCases = [
    {
        name: "test1, should return 100000000000000000000",
        input: "100.0",
        expect: "100000000000000000000"
    },
    {
        name: "test2, should return 1234567890000000000000",
        input: "1234.56789",
        expect: "1234567890000000000000"
    },
    {
        name: "test3, should return 123456789000000000000000000",
        input: "123456789",
        expect: "123456789000000000000000000"
    },
    {
        name: "test4, should return false for invalid value",
        input: "1234.abcde",
        expect: false
    },
    {
        name: "test5, should return false for invalid value",
        input: "abcd.1234",
        expect: false
    },
    {
        name: "test6, should return false for invalid value",
        input: "abcd1234",
        expect: false
    },
    {
        name: "test7, should return false for empty value",
        input: "",
        expect: false
    },
    {
        name: "test8, should return 1000000000000000000",
        input: "1.0",
        expect: "1000000000000000000"
    },
    {
        name: "test9, should return 100000000000000000",
        input: "0.1",
        expect: "100000000000000000"
    },
    {
        name: "test10, should return 1000000",
        input: "0.000000000001",
        expect: "1000000"
    },
    {
        name: "test11, should return false for input is not string type",
        input: 123.111,
        expect: false
    },
    {
        name: "test12, should return 100000000000000000000",
        input: "100",
        expect: "100000000000000000000"
    },
    {
        name: "test13, should return 0",
        input: "0",
        expect: "0"
    }
];

describe("input price value convert test", function () {
    for (let i = 0; i < inputPriceConvertTestCases.length; i++) {
        it(inputPriceConvertTestCases[i].name, async function () {
            const re = await util.requestPriceConverter(inputPriceConvertTestCases[i].input, 18);
            console.log(re);
            expect(re).to.equals(inputPriceConvertTestCases[i].expect)
        })
    }
});

const stringCheckTestCases = [
    {
        name: "test1, should return false, empty input",
        input: "",
        expect: false
    },
    {
        name: "test2, should return false, input <nil>",
        input: "<nil>",
        expect: false
    },
    {
        name: "test3, should return false, undefined input",
        input: undefined,
        expect: false
    },
    {
        name: "test4, should return true",
        input: 12345,
        expect: true
    }
];

describe("valid string check test", function () {
    for (let i = 0; i < stringCheckTestCases.length; i++) {
        it(inputPriceConvertTestCases[i].name, function () {
            const re = util.isValidString(stringCheckTestCases[i].input);
            expect(re).to.equals(stringCheckTestCases[i].expect)
        })
    }
});

const parseDomainReplyTestCases = [
    {
        name: "test1",
        input: [
            {
                owner: "ownerAddress",
                beneficiary: "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c1",
                name: "name",
                creationHeight: "creationHeight",
                lastUpdateHeight: "lastUpdateHeight",
                activeFlag: "activeFlag",
                onSaleFlag: "onSaleFlag",
                salePrice: {
                    currency: {
                        name: "OLT",
                        decimal: 10
                    },
                    amount: "123400000000000000001"
                },
            }
        ],
        expect: {salePrice: '12340000000.0000000001', currency: 'OLT'}
    },
    {
        name: "test2",
        input: [
            {
                owner: "ownerAddress",
                beneficiary: "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c1",
                name: "name",
                creationHeight: "creationHeight",
                lastUpdateHeight: "lastUpdateHeight",
                activeFlag: "activeFlag",
                onSaleFlag: "onSaleFlag",
                salePrice: {
                    currency: {
                        name: "OLT",
                        decimal: 18
                    },
                    amount: "123400000000000000001"
                },
            }
        ],
        expect: {salePrice: '123.400000000000000001', currency: 'OLT'}
    },
    {
        name: "test3",
        input: [
            {
                owner: "ownerAddress",
                beneficiary: "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c1",
                name: "name",
                creationHeight: "creationHeight",
                lastUpdateHeight: "lastUpdateHeight",
                activeFlag: "activeFlag",
                onSaleFlag: "onSaleFlag",
                salePrice: {
                    currency: {
                        name: "OLT",
                        decimal: 18
                    },
                    amount: "123400000000000000000"
                },
            }
        ],
        expect: {salePrice: '123.4', currency: 'OLT'}
    },
    {
        name: "test4",
        input: [
            {
                owner: "ownerAddress",
                beneficiary: "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c1",
                name: "name",
                creationHeight: "creationHeight",
                lastUpdateHeight: "lastUpdateHeight",
                activeFlag: "activeFlag",
                onSaleFlag: "onSaleFlag",
                salePrice: undefined,
            }
        ],
        expect: {salePrice: "", currency: ""}
    },
    {
        name: "test5",
        input: [
            {
                owner: "ownerAddress",
                beneficiary: "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c1",
                name: "name",
                creationHeight: "creationHeight",
                lastUpdateHeight: "lastUpdateHeight",
                activeFlag: "activeFlag",
                onSaleFlag: "onSaleFlag",
                salePrice: '<nil>'
            }
        ],
        expect: {salePrice: "", currency: ""}
    },
    {
        name: "test6",
        input: [],
        expect: {salePrice: "", currency: ""}
    },
    {
        name: "test7",
        input: [
            {
                owner: "ownerAddress",
                beneficiary: "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c1",
                name: "name",
                creationHeight: "creationHeight",
                lastUpdateHeight: "lastUpdateHeight",
                activeFlag: "activeFlag",
                onSaleFlag: "onSaleFlag",
                salePrice: null
            }
        ],
        expect: {salePrice: "", currency: ""}
    },
    {
        name: "test8 empty beneficiary address",
        input: [
            {
                owner: "ownerAddress",
                beneficiary: "",
                name: "name",
                creationHeight: "creationHeight",
                lastUpdateHeight: "lastUpdateHeight",
                activeFlag: "activeFlag",
                onSaleFlag: "onSaleFlag",
                salePrice: null
            }
        ],
        expect: {salePrice: "", currency: ""}
    },
];

describe("parse domain reply test", function () {
    while (parseDomainReplyTestCases.length > 0) {
        const testcase = parseDomainReplyTestCases.shift();
        it(testcase.name, async function () {
            const re = await util.parseDomainReply(testcase.input, env, 0,).catch(rej => {
                console.log("rej", rej);
            });
            console.log(re);
            if (re !== undefined && re.length > 0) {
                expect(re[0].salePrice).equals(testcase.expect.salePrice);
                should.exist(re[0].beneficiaryBalance)
                console.log(re[0].beneficiaryBalance)
            }

        });
    }
});

const validOLTAddressTestCases = [
    {
        name: "test1",
        input: "0lt123",
        expect: false
    },
    {
        name: "test2",
        input: "0lt2a656721b7174232b504084cecde82ee2d0c1454",
        expect: true
    },
    {
        name: "test3",
        input: "2a656721b7174232b504084cecde82ee2d0c1454",
        expect: false
    }
];

describe("valid address without keytype test", function () {
    while (validOLTAddressTestCases.length > 0) {
        const testcase = validOLTAddressTestCases.shift();
        it(testcase.name, function () {
            const re = util.isValidOLTAddress(testcase.input);
            console.log(re);
            expect(re).to.equals(testcase.expect)
        });
    }
});

const validOtherAddressTestCases = [
    {
        name: "test1",
        input: "0x10a4BBD4997b1B4a321709328195ae2306202129",
        inputCurrency: "ETH",
        expect: true
    },
    {
        name: "test2",
        input: "1GW2vetUmHXJm8xJQbYUytKbHGtd3pevFV",
        inputCurrency: "ETH",
        expect: false
    },
    {
        name: "test3",
        input: "0lt2a656721b7174232b504084cecde82ee2d0c145",
        inputCurrency: "OLT",
        expect: false
    },
    {
        name: "test4",
        input: "0lt2a656721b7174232b504084cecde82ee2d0c1451",
        inputCurrency: "OLT",
        expect: true
    },
    {
        name: "test5",
        input: "1GW2vetUmHXJm8xJQbYUytKbHGtd3pevFV",
        inputCurrency: "BTCP2PKH",
        expect: true
    },
    {
        name: "test6",
        input: "03f0777057f3eda3bdd6da5eae2145592c750b0503c783224531f5f7c8c64701b9",
        inputCurrency: "BTCP2PK",
        expect: true
    },
    {
        name: "test7",
        input: "03f0777057f3eda3bdd6da5eae2145592c750b0503c783224531f5f7c8c64701b9",
        inputCurrency: "ABCD",
        expect: -11014
    },
    {
        name: "test8",
        input: "0x10a4BBD4997b1B4a321709328195ae2306202129",
        inputCurrency: "BTC",
        expect: false
    },
    {
        name: "test9",
        input: "03f0777057f3eda3bdd6da5eae2145592c750b0503c783224531f5f7c8c64701b9",
        inputCurrency: "BTC",
        expect: true
    },
    {
        name: "test10",
        input: "1GW2vetUmHXJm8xJQbYUytKbHGtd3pevFV",
        inputCurrency: "BTC",
        expect: true
    },
    {
        name: "test11",
        input: undefined,
        inputCurrency: "OLT",
        expect: false
    },
    {
        name: "test12",
        input: null,
        inputCurrency: "OLT",
        expect: false
    },
    {
        name: "test13",
        input: "0x9a59efaa736beb8feaabcbc9ab7c99d4b8c712af",
        inputCurrency: "BTC",
        expect: false
    },
    {
        name: "test14",
        input: "",
        inputCurrency: "BTC",
        expect: false
    },
    {
        name: "test15",
        input: "",
        inputCurrency: undefined,
        expect: false
    },
    {
        name: "test15",
        input: "",
        inputCurrency: null,
        expect: false
    },
    {
        name: "test16",
        input: "0lt9a59efaa736beb8feaabcbc9ab7c99d4b8c712af",
        expect: true
    },
    {
        name: "test17",
        input: undefined,
        expect: false
    }
];

describe("valid address with keytype test", function () {
    while (validOtherAddressTestCases.length > 0) {
        const testcase = validOtherAddressTestCases.shift();
        it(testcase.name, async function () {
            const re = await util.isValidAccountAddress(testcase.input, testcase.inputCurrency).catch(error => {
                console.log("error ", error);
                expect(error.error.code).to.equals(testcase.expect);
            });
            if (typeof re !== "undefined") {
                console.log(re);
                console.log("type of result ", typeof re);
                should.equal(typeof re, "boolean");
                expect(re).to.equals(testcase.expect)
            }
        });
    }
});

const validDomainNameTestCases = [
    {
        name: "test1",
        input: "0x123",
        expect: false
    },
    {
        name: "test2",
        input: "0x2a656721b7174232b504084cecde82ee2d0c1454",
        expect: false
    },
    {
        name: "test3",
        input: "0x2a656721b7174232b504084cecde82ee2d0c1454.ol",
        expect: true
    },
    {
        name: "test4",
        input: "0x2a656721b7174232b504084cecde82ee2d0c1454.olt.olt",
        expect: false
    },
    {
        name: "test5",
        input: "0x2a656721b717412312ADADADSFsdfsdfsd232b504084cecde82ee2d0c14545.ol",
        expect: true
    },
    {
        name: "test6",
        input: ".olt",
        expect: false
    },
    {
        name: "test7",
        input: "123abc.BTC",
        expect: false
    },
    {
        name: "test8",
        input: "0d2a656721b717412312ADADADSFsdfsdfsd232b504084cecde82ee2d0c145456.olt",
        expect: false
    },
    {
        name: "test9",
        input: "0d2a656721b717412312ADADADSFsdfsdfsd232b504084cecde82ee2d0c14545.OLT",
        expect: false
    },
    {
        name: "test10",
        input: "0x2a656721b717412312ADADADSFsdfsdfsd232b504084cecde82ee2d0c14545.btc",
        expect: false
    },
    {
        name: "test11",
        input: "0d2a656721b717412312ADADADSFsdfsdfsd232b504084cecde82ee2d0c14545.btc.btc",
        expect: false
    },
    {
        name: "test12",
        input: ".BTC",
        expect: false
    }, {
        name: "test13",
        input: ".btc",
        expect: false
    },
    {
        name: "test14",
        input: "aabbbccfffooeee.BTC.olt",
        expect: false
    },
    {
        name: "test15",
        input: ".abbbccfffooeee.btc.OLT",
        expect: false
    },
    {
        name: "test16",
        input: "@aabbbccfffooeee.btc.OLT",
        expect: false
    },
    {
        name: "test17",
        input: "_aabbbccfffooeee.btc.OLT",
        expect: false
    },
    {
        name: "test18",
        input: "..btc.OLT",
        expect: false
    },
    {
        name: "test19",
        input: "aabbbccfffooeee.btc.eth",
        expect: false
    },
    {
        name: "test20",
        input: "aabbbccfffooeee.ETH",
        expect: false
    },
    {
        name: "test21",
        input: "aabbbccfffooeee.eth",
        expect: false
    },
    {
        name: "test22",
        input: "0d2a656721b717412312ADADADSFsdfsdfsd232b504084cecde82ee2d0c145451.eth",
        expect: false
    }, {
        name: "test23",
        input: "0d2a656721b717412312ADADADSFsdfsdfsd232b504084cecde82ee2d0c145451.btc",
        expect: false
    }
    , {
        name: "test24",
        input: "0d2a656721b717412312ADADADSFsdfsdfsd232b504084cecde82ee2d0c145451.ETH",
        expect: false
    },
    {
        name: "test25",
        input: "0d2a656721b717412312ADADADSFsdfsdfsd232b504084cecde82ee2d0c14.ETH.olt",
        expect: false
    },
    {
        name: "test26",
        input: "@0d2a656721b717412312ADADADSFsdfsdfsd232b504084cecde82e2.ETH.olt",
        expect: false
    },
    {
        name: "test27",
        input: "0d2a656721b717412312ADADADSFsdfsdfsd232b504084cecde82e2.Eth",
        expect: false
    },
    {
        name: "test28",
        input: ".eth.Eth",
        expect: false
    },
    {
        name: "test29",
        input: ".eth",
        expect: false
    },
    {
        name: "test30",
        input: ".eth.",
        expect: false
    },
    {
        name: "test31",
        input: "123.abc",
        expect: false
    },
    {
        name: "test32",
        input: "123.abc.123.ABD.ol",
        expect: true
    },
    {
        name: "test33",
        input: "123.abc.123.ABD!@#.ol",
        expect: false
    },
    {
        name: "test34",
        input: "",
        expect: false
    },
    {
        name: "test35, 256 chars long but no valid extension",
        input: "1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.123456",
        expect: false
    },
    {
        name: "test36, 256 chars long with valid extension",
        input: "1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.1234.abcd.123.ol",
        expect: true
    },
    {
        name: "test37, no platform is given",
        input: "0x123",
        input_env: {},
        expect: false
    },
    {
        name: "test38, wrong platform is given",
        input: "0x123",
        input_env: {platform: "ABCD"},
        expect: false
    },
    {
        name: "test39, correct platform is given",
        input: "0x123.xl",
        input_env: {platform: "electron"},
        expect: false
    },
    {
        name: "test40, correct platform is given",
        input: "0x123.ol",
        input_env: {platform: "electron", storeLocation: __dirname},
        expect: true
    },
    {
        name: "test41, correct platform but wrong storeLocation is given",
        input: "0x123.ol",
        input_env: {platform: "electron", storeLocation: "123"},
        expect: false
    },
    {
        name: "test42, correct platform but wrong storeLocation is given",
        input: "0x123.ol",
        input_env: {platform: "electron", storeLocation: 123},
        expect: false
    },
    {
        name: "test43, invalid extension",
        input: "0x123.olt",
        input_env: {platform: "electron", storeLocation: __dirname},
        expect: false
    },
    {
        name: "test44, invalid domain name",
        input: "@0x123.ol",
        input_env: {platform: "electron", storeLocation: __dirname},
        expect: false
    },
    {
        name: "test45, invalid domain name",
        input: "@!@#.x123.ol",
        input_env: {platform: "electron", storeLocation: __dirname},
        expect: false
    },
    {
        name: "test46, valid domain name",
        input: "abcd.123.123.ol",
        input_env: {platform: "electron", storeLocation: __dirname},
        expect: true
    },
    {
        name: "test46, invalid domain name",
        input: ".123.123.ol",
        input_env: {platform: "electron", storeLocation: __dirname},
        expect: false
    }
];

describe("valid domain name test", function () {
    while (validDomainNameTestCases.length > 0) {
        const testcase = validDomainNameTestCases.shift();
        it(testcase.name, async function () {
            if (typeof testcase.input_env === "undefined") testcase.input_env = {
                platform: "electron",
                storeLocation: __dirname
            };
            const re = await util.validateDomainName(testcase.input, testcase.input_env).catch(err => {
                console.log("err ", err);
                should.equal(false, testcase.expect)
            });
            console.log("re ", re);
            if (typeof re !== "undefined") expect(re).to.equals(testcase.expect)
        });
    }
    after(() => {
        try {
            const fileList = ["./test/oneledger_sdk_config.json"];
            removeCreatedTestFiles(fileList)
        } catch (err) {
            should.fail(err, undefined, err)
        }
    })
});

const getDomainExtensionTestcases = [
    {
        name: "test1",
        input: "testdomain.olt",
        expect: "OLT"
    },
    {
        name: "test2",
        input: "testdomain.btc",
        expect: "BTC"
    },
    {
        name: "test3",
        input: "testdomain.eth",
        expect: "ETH"
    }
];

describe("get domain name extension test", function () {
    getDomainExtensionTestcases.forEach(testcase => {
        it(testcase.name, function () {
            const result = util.getDomainExtension(testcase.input);
            should.equal(result, testcase.expect)
        });
    })
});

const URITestcases = [
    {
        name: "test1",
        input: "123456687",
        expect: false
    },
    {
        name: "test2",
        input: "testdomain.btc",
        expect: false
    },
    {
        name: "test3",
        input: "http://127.0.0.1",
        expect: true
    },
    {
        name: "test4",
        input: "https://127.0.0.1",
        expect: true
    },
    {
        name: "test5",
        input: "ipfs://127.0.0.1",
        expect: true
    },
    {
        name: "test6",
        input: "ftp://127.0.0.1",
        expect: true
    },
    {
        name: "test7",
        input: "sw://127.0.0.1",
        expect: false
    },
    {
        name: "test7",
        input: "",
        expect: false
    }
];

describe("valid uri test", function () {
    URITestcases.forEach(testcase => {
        it(testcase.name, function () {
            const result = util.isValidUri(testcase.input);
            should.equal(result, testcase.expect)
        });
    })
});

const calculateTxGasTestcases = [
    {
        name: "test1",
        input: {txType: 0x01, txData: "", gasAdjustment: 0},
        expect: 40000
    },
    {
        name: "test2",
        input: {txType: 0x11, txData: "", gasAdjustment: 5000},
        expect: 45000
    }
];

describe("calculate tx gas test", function () {
    calculateTxGasTestcases.forEach(testcase => {
        it(testcase.name, function () {
            const result = util.calculateTxGas(testcase.input);
            should.equal(result, testcase.expect)
        });
    })
});

const txFeeEstimatorTestcases = [
    {
        name: "test1",
        input: 40000,
        inputGasPrice: {currency: "OLT", value: "1000000000"},
        expect: true
    },
    {
        name: "test2",
        input: 40000,
        inputGasPrice: {currency: "ETH", value: "1000000000"},
        expect: -12030
    }
];

describe("tx fee estimator test", function () {
    txFeeEstimatorTestcases.forEach(testcase => {
        it(testcase.name, async function () {
            const result = await util.txFeeEstimator(testcase.input, testcase.inputGasPrice).catch(err => {
                console.log("REJ", err);
                expect(err.error.code).to.equals(testcase.expect)
            });
            if (typeof result !== "undefined") {
                console.log("re", result);
                expect(result.response).to.exist
            }
        });
    })
});

const getCurrencyTestcases = [
    {
        name: "test 1, OLT",
        input: "OLT",
        expect: {currency: 'OLT', decimal: 18}
    },
    {
        name: "test 2, ETH",
        input: "ETH",
        expect: {currency: 'ETH', decimal: 18}
    },
    {
        name: "test 3, OETH",
        input: "OETH",
        expect: -12029
    },
    {
        name: "test 4, olt",
        input: "olt",
        expect: -12029
    },
    {
        name: "test 5, not give any name",
        input: undefined,
        expect: -12029
    },
    {
        name: "test 6, give invalid name",
        input: 123,
        expect: -12029
    }
];

describe("get currency test", function () {
    getCurrencyTestcases.forEach(testcase => {
        it(testcase.name, async function () {
            const c = await util.getCurrency(testcase.input).catch(err => {
                console.log(err);
                expect(err.error.code).to.equals(testcase.expect)
            });
            if (typeof c !== "undefined") {
                expect(c).deep.equal(testcase.expect)
            }
        });
    })
});

const parseQueryProposalTestcases = [
    {
        name: "test 1",
        inputProposalStats: undefined,
        inputCurrentHeight: undefined,
        expect: []
    },
    {
        name: "test 2",
        inputProposalStats: undefined,
        inputCurrentHeight: 1000,
        expect: []
    },
    {
        name: "test 3",
        inputProposalStats: [{
            proposal: {
                proposalId: "id",
                proposalType: 0x20,
                status: 0x23,
                outcome: 0x26,
                headline: "something",
                descr: "somthing",
                proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                fundingDeadline: 5000,
                fundingGoal: "10000000000",
                votingDeadline: 10000,
                passPercent: 51
            },
            funds: "10000000",
            votes: {result: 18, powerYes: 0, powerNo: 0, powerAll: 0}
        }],
        inputCurrentHeight: undefined,
        expect: [{
            proposal:
                {
                    proposalId: 'id',
                    proposalType: 'ConfigUpdate',
                    status: 'Funding',
                    statusForUI: 'Unknown',
                    outCome: 'InProgress',
                    headline: 'something',
                    description: 'somthing',
                    proposer: '0lt52901e9603f9d504049c9d79132e3e9c2820b6a4',
                    fundingDeadline: 5000,
                    fundingGoal: '0.00000001 OLT',
                    votingDeadline: 10000,
                    passPercent: 51
                },
            funds: '0.00000000001 OLT',
            votes: {result: 18, powerYes: 0, powerNo: 0, powerAll: 0},
            currentHeight: 0
        }]
    },
    {
        name: "test 4",
        inputProposalStats: [{
            proposal: {
                proposalId: "id",
                proposalType: "0x20",
                status: 0x23,
                outcome: 0x26,
                headline: "something",
                descr: "somthing",
                proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                fundingDeadline: 5000,
                fundingGoal: "10000000000",
                votingDeadline: 10000,
                passPercent: 51
            },
            funds: "10000000",
            votes: {result: 18, powerYes: 0, powerNo: 0, powerAll: 0}
        }],
        inputCurrentHeight: undefined,
        expect: [{
            proposal:
                {
                    proposalId: 'id',
                    proposalType: undefined,
                    status: 'Funding',
                    statusForUI: 'Unknown',
                    outCome: 'InProgress',
                    headline: 'something',
                    description: 'somthing',
                    proposer: '0lt52901e9603f9d504049c9d79132e3e9c2820b6a4',
                    fundingDeadline: 5000,
                    fundingGoal: '0.00000001 OLT',
                    votingDeadline: 10000,
                    passPercent: 51
                },
            funds: '0.00000000001 OLT',
            votes: {result: 18, powerYes: 0, powerNo: 0, powerAll: 0},
            currentHeight: 0
        }]
    },
    {
        name: "test 5",
        inputProposalStats: [{
            proposal: {
                proposalId: "id",
                proposalType: "0x20",
                status: 0x23,
                outcome: 0x26,
                headline: "something",
                descr: "somthing",
                proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                fundingDeadline: 5000,
                fundingGoal: 10000000000,
                votingDeadline: 10000,
                passPercent: 51
            },
            funds: "10000000",
            votes: {result: 18, powerYes: 0, powerNo: 0, powerAll: 0}
        }],
        inputCurrentHeight: undefined,
        expect: "TypeError: amount.indexOf is not a function"
    },
    {
        name: "test 6",
        inputProposalStats: [{
            proposal: {
                proposalId: "id",
                proposalType: "0x20",
                status: 0x23,
                outcome: 0x26,
                headline: "something",
                descr: "somthing",
                proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                fundingDeadline: 5000,
                fundingGoal: 10000000000,
                votingDeadline: 10000,
                passPercent: 51
            },
            funds: 10000000,
            votes: {result: 18, powerYes: 0, powerNo: 0, powerAll: 0}
        }],
        inputCurrentHeight: undefined,
        expect: "TypeError: amount.indexOf is not a function"
    }
];

describe("parse proposal reply test", function () {
    while (parseQueryProposalTestcases.length > 0) {
        const testcase = parseQueryProposalTestcases.shift();
        it(testcase.name, function () {
            let re;
            try {
                re = util.parseProposalReply(testcase.inputProposalStats, testcase.inputCurrentHeight);
            } catch (err) {
                console.log("error: ", err.toString());
                expect(err.toString()).equal(testcase.expect);
                return
            }
            console.log(re);
            expect(re).deep.equal(testcase.expect)
        });
    }
});

const statusForUITestcases = [
    {
        name: "test 1: funding in progress",
        inputProposal: {
            proposalId: "id",
            proposalType: 0x20,
            status: 0x23,
            outcome: 0x26,
            headline: "something",
            descr: "somthing",
            proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            fundingDeadline: 5000,
            fundingGoal: "10000000000",
            votingDeadline: 10000,
            passPercent: 51
        },
        inputCurrentHeight: 4500,
        expect: "FundingInProgress"
    },
    {
        name: "test 2: voting in progress",
        inputProposal: {
            proposalId: "id",
            proposalType: 0x20,
            status: 0x24,
            outcome: 0x26,
            headline: "something",
            descr: "somthing",
            proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            fundingDeadline: 5000,
            fundingGoal: "10000000000",
            votingDeadline: 10000,
            passPercent: 51
        },
        inputCurrentHeight: 6000,
        expect: "VotingInProgress"
    },
    {
        name: "test 3: approved",
        inputProposal: {
            proposalId: "id",
            proposalType: 0x20,
            status: 0x25,
            outcome: 0x31,
            headline: "something",
            descr: "somthing",
            proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            fundingDeadline: 5000,
            fundingGoal: "10000000000",
            votingDeadline: 10000,
            passPercent: 51
        },
        inputCurrentHeight: undefined,
        expect: "Approved"
    },
    {
        name: "test 4: rejected",
        inputProposal: {
            proposalId: "id",
            proposalType: 0x20,
            status: 0x25,
            outcome: 0x29,
            headline: "something",
            descr: "somthing",
            proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            fundingDeadline: 5000,
            fundingGoal: "10000000000",
            votingDeadline: 10000,
            passPercent: 51
        },
        inputCurrentHeight: undefined,
        expect: "Rejected"
    },
    {
        name: "test 5: funding failed 1",
        inputProposal: {
            proposalId: "id",
            proposalType: 0x20,
            status: 0x23,
            outcome: 0x26,
            headline: "something",
            descr: "somthing",
            proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            fundingDeadline: 5000,
            fundingGoal: "10000000000",
            votingDeadline: 10000,
            passPercent: 51
        },
        inputCurrentHeight: 8000,
        expect: "FundingFailed"
    },
    {
        name: "test 6: funding failed 2",
        inputProposal: {
            proposalId: "id",
            proposalType: 0x20,
            status: 0x25,
            outcome: 0x27,
            headline: "something",
            descr: "somthing",
            proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            fundingDeadline: 5000,
            fundingGoal: "10000000000",
            votingDeadline: 10000,
            passPercent: 51
        },
        inputCurrentHeight: 8000,
        expect: "FundingFailed"
    },
    {
        name: "test 7: cancelled",
        inputProposal: {
            proposalId: "id",
            proposalType: 0x20,
            status: 0x25,
            outcome: 0x30,
            headline: "something",
            descr: "somthing",
            proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            fundingDeadline: 5000,
            fundingGoal: "10000000000",
            votingDeadline: 10000,
            passPercent: 51
        },
        inputCurrentHeight: 8000,
        expect: "Cancelled"
    },
    {
        name: "test 8: expired",
        inputProposal: {
            proposalId: "id",
            proposalType: 0x20,
            status: 0x25,
            outcome: 0x28,
            headline: "something",
            descr: "somthing",
            proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            fundingDeadline: 5000,
            fundingGoal: "10000000000",
            votingDeadline: 10000,
            passPercent: 51
        },
        inputCurrentHeight: 8000,
        expect: "Expired"
    },
    {
        name: "test 9: Unknown 1",
        inputProposal: {
            proposalId: "id",
            proposalType: 0x20,
            status: 0x23,
            outcome: 0x26,
            headline: "something",
            descr: "somthing",
            proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            fundingDeadline: 5000,
            fundingGoal: "10000000000",
            votingDeadline: 10000,
            passPercent: 51
        },
        inputCurrentHeight: undefined,
        expect: "Unknown"
    },
    {
        name: "test 10: Unknown 2",
        inputProposal: {
            proposalId: "id",
            proposalType: 0x20,
            status: 0x25,
            outcome: 0x26,
            headline: "something",
            descr: "somthing",
            proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            fundingDeadline: 5000,
            fundingGoal: "10000000000",
            votingDeadline: 10000,
            passPercent: 51
        },
        inputCurrentHeight: undefined,
        expect: "Unknown"
    }
];

describe("status for UI test", function () {
    while (statusForUITestcases.length > 0) {
        const testcase = statusForUITestcases.shift();
        it(testcase.name, function () {
            const re = util.getStatusForUI(testcase.inputProposal, testcase.inputCurrentHeight);
            console.log(re);
            expect(re).equal(testcase.expect)
        });
    }
});

const hashTestcases = [
    {
        name: "test1",
        input: "123456",
        expect: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"
    },
    {
        name: "test2",
        input: "1234567890",
        expect: "c775e7b757ede630cd0aa1113bd102661ab38829ca52a6422ab782862f268646"
    },
    {
        name: "test3",
        input: "",
        expect: ""
    },
    {
        name: "test4",
        input: undefined,
        expect: ""
    },
    {
        name: "test5",
        input: {
            a: "a",
            b: "b"
        },
        expect: "TypeError [ERR_INVALID_ARG_TYPE]: The \"data\" argument must be one of type string, TypedArray, or DataView. Received type object"
    }
];

describe("hash test", function () {
    while (hashTestcases.length > 0) {
        const testcase = hashTestcases.shift();
        it(testcase.name, async function () {
            let re;
            try {
                re = await util.hash(testcase.input)
            } catch (err) {
                console.log("err:", err.toString());
                expect(err.toString()).equal(testcase.expect);
                return
            }
            console.log(re);
            expect(re).equal(testcase.expect)
        })
    }
});
