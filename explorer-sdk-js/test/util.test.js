const util = require("../util");
const expect = require('chai').expect;

const isNonNegativeIntTestcases = [
    {
        name: "test1",
        input: -1,
        expect: false
    },
    {
        name: "test2",
        input: 0,
        expect: true
    },
    {
        name: "test3",
        input: 1,
        expect: true
    },
    {
        name: "test4",
        input: -1.100,
        expect: false
    },
    {
        name: "test5",
        input: "-1.100",
        expect: false
    },
    {
        name: "test6",
        input: "1.1001",
        expect: false
    },
    {
        name: "test7",
        input: 1.1001,
        expect: false
    },
    {
        name: "test8",
        input: 11111111111111,
        expect: true
    },
    {
        name: "test9",
        input: "0",
        expect: true
    }
];

describe("test is not negative int", function () {
    isNonNegativeIntTestcases.forEach(function (testcase) {
        it(testcase.name, function () {
            const re = util.isNonNegativeInteger(testcase.input);
            console.log("re ", re);
            expect(re).to.equals(testcase.expect)
        })
    })
});

const ispositiveIntTestcases = [
    {
        name: "test1",
        input: -1,
        expect: false
    },
    {
        name: "test2",
        input: 0,
        expect: false
    },
    {
        name: "test3",
        input: 1,
        expect: true
    },
    {
        name: "test4",
        input: -1.100,
        expect: false
    },
    {
        name: "test5",
        input: "-1.100",
        expect: false
    },
    {
        name: "test6",
        input: "1.1001",
        expect: false
    },
    {
        name: "test7",
        input: 1.1001,
        expect: false
    },
    {
        name: "test8",
        input: 11111111111111,
        expect: true
    }
];

describe("test is positive int", function () {
    ispositiveIntTestcases.forEach(function (testcase) {
        it(testcase.name, function () {
            const re = util.isPositiveInteger(testcase.input);
            console.log("re ", re);
            expect(re).to.equals(testcase.expect)
        })
    })
});

const isSendAmountValidTestcases = [
    {
        name: "test1",
        input: "1000000000 OLT",
        expect: true
    },
    {
        name: "test2",
        input: "1000000000OLT",
        expect: true
    },
    {
        name: "test3",
        input: "1000000000ABC",
        expect: false
    },
    {
        name: "test4",
        input: "1000000000.0000000 olt",
        expect: false
    },
    {
        name: "test4",
        input: "1111 OLT",
        expect: true
    }
];

describe("test isSendAmountValid", function () {
    isSendAmountValidTestcases.forEach(function (testcase) {
        it(testcase.name, function () {
            const re = util.isSendAmountValid(testcase.input);
            console.log("re ", re);
            expect(re).to.equals(testcase.expect)
        })
    })
});

const accountTxsResultTestCases = [
    {
        name: "test1",
        input: {
            "txs": [
                {
                    "type": "SEND",
                    "blockHeight": 7,
                    "hash": "0x591cb46c1af58945b950ac3d4c01fa312c1379c37e2ee057e4c030bc0aa2a973",
                    "from": "0ltf1e5ccbdb13e078f9934afd8e441ae6ae0d6fe0a",
                    "recipients": [
                        {
                            "account": "0lt0810b60485d93241fd853a7bb50b958749e99aa4",
                            "amount": "10000000000000000000000 OLT"
                        },
                        {
                            "account": "0lt1234567890123456789012345678901234567890",
                            "amount": "102340005678000000 OLT"
                        },
                        {
                            "account": "0lt1234",
                            "amount": "102340005678000111 OLT"
                        }
                    ],
                    "fee": {
                        "amount": "1000000000010000000 OLT",
                        "gas": 0
                    },
                    "memo": "bc19edae-b498-11e9-8544-acde48001122"
                },
                {
                    "type": "SEND",
                    "blockHeight": 5,
                    "hash": "0x7a7beae718dc46ab68639d8ae805c92ecca86762da1232756bd1a047d8345193",
                    "from": "0ltf1e5ccbdb13e078f9934afd8e441ae6ae0d6fe0a",
                    "recipients": [
                        {
                            "account": "0lt0810b60485d93241fd853a7bb50b958749e99aa4",
                            "amount": "10000000000000000000000 OLT"
                        }
                    ],
                    "fee": {
                        "amount": "10000000000000000000000 OLT",
                        "gas": 0
                    },
                    "memo": "2e0efeb0-b497-11e9-8544-acde48001122"
                }
            ],
            "page": 1,
            "totalTxs": 2
        },
        expect: ""
    },
    {
        name: "test2",
        input: {
            "txs": [
                {
                    "type": "SEND",
                    "blockHeight": 7,
                    "hash": "0x591cb46c1af58945b950ac3d4c01fa312c1379c37e2ee057e4c030bc0aa2a973",
                    "from": function () {

                    },
                    "recipients": [
                        {
                            "account": "0lt0810b60485d93241fd853a7bb50b958749e99aa4",
                            "amount": "10000000000000000000000 OLT"
                        },
                        {
                            "account": "0lt1234567890123456789012345678901234567890",
                            "amount": "102340005678000000 OLT"
                        },
                        {
                            "account": Infinity,
                            "amount": null
                        }
                    ],
                    "fee": {
                        "amount": "1000000000010000000 OLT",
                        "gas": 0
                    },
                    "memo": "bc19edae-b498-11e9-8544-acde48001122"
                },
                {
                    "type": "SEND",
                    "blockHeight": 5,
                    "hash": "0x7a7beae718dc46ab68639d8ae805c92ecca86762da1232756bd1a047d8345193",
                    "from": "0ltf1e5ccbdb13e078f9934afd8e441ae6ae0d6fe0a",
                    "recipients": [
                        {
                            "account": "0lt0810b60485d93241fd853a7bb50b958749e99aa4",
                            "amount": "10000000000000000000000 OLT"
                        },
                        {
                            "account": "0lt0749e99aa4",
                            "amount": "100000000000000000001120 OLT"
                        }
                    ],
                    "fee": {
                        "amount": "10000000000000000000000 OLT",
                        "gas": 0
                    },
                    "memo": "2e0efeb0-b497-11e9-8544-acde48001122"
                }
            ],
            "page": 1,
            "totalTxs": 2
        },
        expect: ""
    }
];

describe("test parseAccountTxsResult", function () {
    accountTxsResultTestCases.forEach(function (testcase) {
        it(testcase.name, async function () {
            const re = await util.parseAccountTxsResult(testcase.input).catch(err => {
                console.log("err ", err);
            });
            console.log("re ", re);
            // expect(re).to.equals(testcase.expect)
        })
    })
});

const txValueMappingTestCases = [
    {
        name: "test1 type send, queried by sender",
        input: {
            "txs": [
                {
                    "txHash": "0xa1206b5ec7e9b71666a497a44160317c7973b6fc880652b0ec442f97d893cc4b",
                    "txType": "SEND",
                    "txFrom": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                    "currentHeight": 3015,
                    "memo": "31cdc070-bf2e-11ea-a059-fd066626c2e0",
                    "txDetail": {
                        "amount": {
                            "currency": "OLT",
                            "value": "1000000000000000000"
                        },
                        "from": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                        "to": "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c8"
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 40000,
                    "totalFee": "0.00004 OLT",
                    "txValue": "1 OLT",
                    "txTo": "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c8"
                }
            ]
        },
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        expect: [
            {
                "txValue": "(-1 OLT)",
            }
        ]
    },
    {
        name: "test2 type send, queried by recipient",
        input: {
            "txs": [
                {
                    "txHash": "0xa1206b5ec7e9b71666a497a44160317c7973b6fc880652b0ec442f97d893cc4b",
                    "txType": "SEND",
                    "txFrom": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                    "currentHeight": 3015,
                    "memo": "31cdc070-bf2e-11ea-a059-fd066626c2e0",
                    "txDetail": {
                        "amount": {
                            "currency": "OLT",
                            "value": "1000000000000000000"
                        },
                        "from": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                        "to": "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c8"
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 40000,
                    "totalFee": "0.00004 OLT",
                    "txValue": "1 OLT",
                    "txTo": "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c8"
                }
            ]
        },
        inputAddress: "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c8",
        expect: [
            {
                "txValue": "1 OLT",
            }
        ]
    },
    {
        name: "test3 type send to domain, queried by sender",
        input: {
            "txs": [
                {
                    "txHash": "0x257b60d7add56c52fe14a53f0c49e6751d431af80916bb64a7133e01ae6e5bb5",
                    "txType": "DOMAIN_SEND",
                    "txFrom": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                    "currentHeight": 3490,
                    "memo": "dc47c2c0-bf2f-11ea-b2b7-57d671083757",
                    "txDetail": {
                        "amount": {
                            "currency": "OLT",
                            "value": "5000000000000000000"
                        },
                        "from": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                        "name": "sendtodomain.ol"
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "5 OLT",
                    "txTo": "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c1"
                }
            ]
        },
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        expect: [
            {
                "txValue": "(-5 OLT)",
            }
        ]
    },
    {
        name: "test4 type send to domain, queried by recipient",
        input: {
            "txs": [
                {
                    "txHash": "0x257b60d7add56c52fe14a53f0c49e6751d431af80916bb64a7133e01ae6e5bb5",
                    "txType": "DOMAIN_SEND",
                    "txFrom": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                    "currentHeight": 3490,
                    "memo": "dc47c2c0-bf2f-11ea-b2b7-57d671083757",
                    "txDetail": {
                        "amount": {
                            "currency": "OLT",
                            "value": "5000000000000000000"
                        },
                        "from": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                        "name": "sendtodomain.ol"
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "5 OLT",
                    "txTo": "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c1"
                }
            ]
        },
        inputAddress: "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c1",
        expect: [
            {
                "txValue": "5 OLT",
            }
        ]
    },
    {
        name: "test5 type domain put on sale",
        input: {
            "txs": [
                {
                    "txHash": "0x6a556832e79ad487846ac3a89cb8e071e2960880c9951a39740feea2720abf51",
                    "txType": "DOMAIN_SELL",
                    "txFrom": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                    "currentHeight": 3018,
                    "memo": "343598b0-bf2e-11ea-a059-fd066626c2e0",
                    "txDetail": {
                        "cancelSale": false,
                        "name": "selltestdomain.ol",
                        "ownerAddress": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                        "price": {
                            "currency": "OLT",
                            "value": "1111000000000000000000"
                        }
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "1111 OLT",
                    "txTo": "selltestdomain.ol"
                }
            ]
        },
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        expect: [
            {
                "txValue": "",
            }
        ]
    },
    {
        name: "test6 type domain put off sale",
        input: {
            "txs": [
                {
                    "txHash": "0x6a556832e79ad487846ac3a89cb8e071e2960880c9951a39740feea2720abf51",
                    "txType": "DOMAIN_SELL",
                    "txFrom": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                    "currentHeight": 3018,
                    "memo": "343598b0-bf2e-11ea-a059-fd066626c2e0",
                    "txDetail": {
                        "cancelSale": true,
                        "name": "selltestdomain.ol",
                        "ownerAddress": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                        "price": {
                            "currency": "OLT",
                            "value": "1111000000000000000000"
                        }
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "1111 OLT",
                    "txTo": "selltestdomain.ol"
                }
            ]
        },
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        expect: [
            {
                "txValue": "",
            }
        ]
    },
    {
        name: "test7 type domain purchase, queried by seller",
        input: {
            "txs": [
                {
                    "txHash": "0xc707c1c79d28180550a9fbdba508708738b8775e49a15990254b03ae03b71cb8",
                    "txType": "DOMAIN_PURCHASE",
                    "txFrom": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                    "currentHeight": 4221,
                    "memo": "728c0370-bf32-11ea-bd35-b5f3619cab41",
                    "txDetail": {
                        "account": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "buyer": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "name": "purchasetestdomain2.ol",
                        "offering": {
                            "currency": "OLT",
                            "value": "1010000000000000000000"
                        }
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "1010 OLT",
                    "txTo": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4"
                },
                {
                    "txHash": "0x1237c1c79d28180550a9fbdba508708738b8775e49a15990254b03ae03b71cb8",
                    "txType": "DOMAIN_PURCHASE",
                    "txFrom": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                    "currentHeight": 4221,
                    "memo": "728c0370-bf32-11ea-bd35-b5f3619cab41",
                    "txDetail": {
                        "account": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "buyer": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "name": "purchasetestdomain2.ol",
                        "offering": {
                            "currency": "OLT",
                            "value": "1010000000000000000000"
                        }
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "1234 OLT",
                    "txTo": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4"
                }
            ]
        },
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        expect: [
            {
                "txValue": "1010 OLT",
            },
            {
                "txValue": "1234 OLT",
            }
        ]
    },
    {
        name: "test8 type domain purchase, queried by buyer",
        input: {
            "txs": [
                {
                    "txHash": "0xc707c1c79d28180550a9fbdba508708738b8775e49a15990254b03ae03b71cb8",
                    "txType": "DOMAIN_PURCHASE",
                    "txFrom": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                    "currentHeight": 4221,
                    "memo": "728c0370-bf32-11ea-bd35-b5f3619cab41",
                    "txDetail": {
                        "account": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "buyer": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "name": "purchasetestdomain2.ol",
                        "offering": {
                            "currency": "OLT",
                            "value": "1010000000000000000000"
                        }
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "1010 OLT",
                    "txTo": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4"
                },
                {
                    "txHash": "0x2222c1c79d28180550a9fbdba508708738b8775e49a15990254b03ae03b71cb8",
                    "txType": "DOMAIN_PURCHASE",
                    "txFrom": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                    "currentHeight": 4221,
                    "memo": "728c0370-bf32-11ea-bd35-b5f3619cab41",
                    "txDetail": {
                        "account": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "buyer": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "name": "purchasetestdomain2.ol",
                        "offering": {
                            "currency": "OLT",
                            "value": "1010000000000000000000"
                        }
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "1111 OLT",
                    "txTo": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4"
                }
            ]
        },
        inputAddress: "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
        expect: [
            {
                "txValue": "(-1010 OLT)",
            },
            {
                "txValue": "(-1111 OLT)",
            }
        ]
    },
    {
        name: "test9 wrong type",
        input: {
            "txs": [
                {
                    "txHash": "0xc707c1c79d28180550a9fbdba508708738b8775e49a15990254b03ae03b71cb8",
                    "txType": "asf",
                    "txFrom": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                    "currentHeight": 4221,
                    "memo": "728c0370-bf32-11ea-bd35-b5f3619cab41",
                    "txDetail": {
                        "account": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "buyer": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "name": "purchasetestdomain2.ol",
                        "offering": {
                            "currency": "OLT",
                            "value": "1010000000000000000000"
                        }
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "1010 OLT",
                    "txTo": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4"
                }
            ]
        },
        inputAddress: "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
        expect: [
            {
                "txValue": "1010 OLT",
            }
        ]
    },
    {
        name: "test10 empty value",
        input: {
            "txs": [
                {
                    "txHash": "0xc707c1c79d28180550a9fbdba508708738b8775e49a15990254b03ae03b71cb8",
                    "txType": "DOMAIN_PURCHASE",
                    "txFrom": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                    "currentHeight": 4221,
                    "memo": "728c0370-bf32-11ea-bd35-b5f3619cab41",
                    "txDetail": {
                        "account": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "buyer": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "name": "purchasetestdomain2.ol",
                        "offering": {
                            "currency": "OLT",
                            "value": "1010000000000000000000"
                        }
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "",
                    "txTo": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4"
                },
            ]
        },
        inputAddress: "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
        expect: [
            {
                "txValue": "",
            }
        ]
    }
];

describe("test txValueMapping", function () {
    txValueMappingTestCases.forEach(function (testcase) {
        it(testcase.name, function () {
            const re = util.txValueMapping(testcase.input.txs, testcase.inputAddress);
            console.log("re ", re);
            for (let i = 0; i < re.length; i++) {
                expect(re[i].txValue).to.equals(testcase.expect[i].txValue)
            }
        })
    })
});

const txTypeCodeMappingTestCases = [
    {
        name: "test1 type send, queried by sender",
        input: {
            "txs": [
                {
                    "txHash": "0xa1206b5ec7e9b71666a497a44160317c7973b6fc880652b0ec442f97d893cc4b",
                    "txType": "SEND",
                    "txFrom": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                    "currentHeight": 3015,
                    "memo": "31cdc070-bf2e-11ea-a059-fd066626c2e0",
                    "txDetail": {
                        "amount": {
                            "currency": "OLT",
                            "value": "1000000000000000000"
                        },
                        "from": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                        "to": "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c8"
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 40000,
                    "totalFee": "0.00004 OLT",
                    "txValue": "(-1 OLT)",
                    "txTo": "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c8",
                    "txOriginalValue": "1 OLT"
                }
            ]
        },
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        expect: [
            {
                "txType": "tx_4001"
            }
        ]
    },
    {
        name: "test2 type send, queried by recipient",
        input: {
            "txs": [
                {
                    "txHash": "0xa1206b5ec7e9b71666a497a44160317c7973b6fc880652b0ec442f97d893cc4b",
                    "txType": "SEND",
                    "txFrom": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                    "currentHeight": 3015,
                    "memo": "31cdc070-bf2e-11ea-a059-fd066626c2e0",
                    "txDetail": {
                        "amount": {
                            "currency": "OLT",
                            "value": "1000000000000000000"
                        },
                        "from": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                        "to": "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c8"
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 40000,
                    "totalFee": "0.00004 OLT",
                    "txValue": "1 OLT",
                    "txTo": "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c8",
                    "txOriginalValue": "1 OLT"
                }
            ]
        },
        inputAddress: "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c8",
        expect: [
            {
                "txType": "tx_4000"
            }
        ]
    },
    {
        name: "test3 type send to domain, queried by sender",
        input: {
            "txs": [
                {
                    "txHash": "0x257b60d7add56c52fe14a53f0c49e6751d431af80916bb64a7133e01ae6e5bb5",
                    "txType": "DOMAIN_SEND",
                    "txFrom": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                    "currentHeight": 3490,
                    "memo": "dc47c2c0-bf2f-11ea-b2b7-57d671083757",
                    "txDetail": {
                        "amount": {
                            "currency": "OLT",
                            "value": "5000000000000000000"
                        },
                        "from": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                        "name": "sendtodomain.ol"
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "(-5 OLT)",
                    "txTo": "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c1",
                    "txOriginalValue": "5 OLT"
                }
            ]
        },
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        expect: [
            {
                "txType": "tx_4011"
            }
        ]
    },
    {
        name: "test4 type send to domain, queried by recipient",
        input: {
            "txs": [
                {
                    "txHash": "0x257b60d7add56c52fe14a53f0c49e6751d431af80916bb64a7133e01ae6e5bb5",
                    "txType": "DOMAIN_SEND",
                    "txFrom": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                    "currentHeight": 3490,
                    "memo": "dc47c2c0-bf2f-11ea-b2b7-57d671083757",
                    "txDetail": {
                        "amount": {
                            "currency": "OLT",
                            "value": "5000000000000000000"
                        },
                        "from": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                        "name": "sendtodomain.ol"
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "5 OLT",
                    "txTo": "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c1",
                    "txOriginalValue": "5 OLT"
                }
            ]
        },
        inputAddress: "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c1",
        expect: [
            {
                "txType": "tx_4010"
            }
        ]
    },
    {
        name: "test5 type domain put on sale",
        input: {
            "txs": [
                {
                    "txHash": "0x6a556832e79ad487846ac3a89cb8e071e2960880c9951a39740feea2720abf51",
                    "txType": "DOMAIN_SELL",
                    "txFrom": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                    "currentHeight": 3018,
                    "memo": "343598b0-bf2e-11ea-a059-fd066626c2e0",
                    "txDetail": {
                        "cancelSale": false,
                        "name": "selltestdomain.ol",
                        "ownerAddress": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                        "price": {
                            "currency": "OLT",
                            "value": "1111000000000000000000"
                        }
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "",
                    "txTo": "selltestdomain.ol",
                    "txOriginalValue": ""
                }
            ]
        },
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        expect: [
            {
                "txType": "tx_4022"
            }
        ]
    },
    {
        name: "test6 type domain put off sale",
        input: {
            "txs": [
                {
                    "txHash": "0x6a556832e79ad487846ac3a89cb8e071e2960880c9951a39740feea2720abf51",
                    "txType": "DOMAIN_SELL",
                    "txFrom": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                    "currentHeight": 3018,
                    "memo": "343598b0-bf2e-11ea-a059-fd066626c2e0",
                    "txDetail": {
                        "cancelSale": true,
                        "name": "selltestdomain.ol",
                        "ownerAddress": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                        "price": {
                            "currency": "OLT",
                            "value": "1111000000000000000000"
                        }
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "",
                    "txTo": "selltestdomain.ol",
                    "txOriginalValue": ""
                }
            ]
        },
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        expect: [
            {
                "txType": "tx_4023"
            }
        ]
    },
    {
        name: "test7 type domain purchase, queried by seller",
        input: {
            "txs": [
                {
                    "txHash": "0xc707c1c79d28180550a9fbdba508708738b8775e49a15990254b03ae03b71cb8",
                    "txType": "DOMAIN_PURCHASE",
                    "txFrom": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                    "currentHeight": 4221,
                    "memo": "728c0370-bf32-11ea-bd35-b5f3619cab41",
                    "txDetail": {
                        "account": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "buyer": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "name": "purchasetestdomain2.ol",
                        "offering": {
                            "currency": "OLT",
                            "value": "1010000000000000000000"
                        }
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "1010 OLT",
                    "txTo": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                    "txOriginalValue": "1010 OLT"
                },
                {
                    "txHash": "0x1237c1c79d28180550a9fbdba508708738b8775e49a15990254b03ae03b71cb8",
                    "txType": "DOMAIN_PURCHASE",
                    "txFrom": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                    "currentHeight": 4221,
                    "memo": "728c0370-bf32-11ea-bd35-b5f3619cab41",
                    "txDetail": {
                        "account": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "buyer": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "name": "purchasetestdomain2.ol",
                        "offering": {
                            "currency": "OLT",
                            "value": "1010000000000000000000"
                        }
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "1234 OLT",
                    "txTo": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                    "txOriginalValue": "1234 OLT"
                }
            ]
        },
        inputAddress: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        expect: [
            {
                "txType": "tx_4025"
            },
            {
                "txType": "tx_4025"
            }
        ]
    },
    {
        name: "test8 type domain purchase, queried by buyer",
        input: {
            "txs": [
                {
                    "txHash": "0xc707c1c79d28180550a9fbdba508708738b8775e49a15990254b03ae03b71cb8",
                    "txType": "DOMAIN_PURCHASE",
                    "txFrom": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                    "currentHeight": 4221,
                    "memo": "728c0370-bf32-11ea-bd35-b5f3619cab41",
                    "txDetail": {
                        "account": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "buyer": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "name": "purchasetestdomain2.ol",
                        "offering": {
                            "currency": "OLT",
                            "value": "1010000000000000000000"
                        }
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "(-1010 OLT)",
                    "txTo": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                    "txOriginalValue": "1010 OLT"
                },
                {
                    "txHash": "0x2222c1c79d28180550a9fbdba508708738b8775e49a15990254b03ae03b71cb8",
                    "txType": "DOMAIN_PURCHASE",
                    "txFrom": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                    "currentHeight": 4221,
                    "memo": "728c0370-bf32-11ea-bd35-b5f3619cab41",
                    "txDetail": {
                        "account": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "buyer": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "name": "purchasetestdomain2.ol",
                        "offering": {
                            "currency": "OLT",
                            "value": "1010000000000000000000"
                        }
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "(-1111 OLT)",
                    "txTo": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                    "txOriginalValue": "1111 OLT"
                }
            ]
        },
        inputAddress: "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
        expect: [
            {
                "txType": "tx_4024"
            },
            {
                "txType": "tx_4024"
            }
        ]
    },
    {
        name: "test9 wrong type",
        input: {
            "txs": [
                {
                    "txHash": "0xc707c1c79d28180550a9fbdba508708738b8775e49a15990254b03ae03b71cb8",
                    "txType": "asf",
                    "txFrom": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                    "currentHeight": 4221,
                    "memo": "728c0370-bf32-11ea-bd35-b5f3619cab41",
                    "txDetail": {
                        "account": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "buyer": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "name": "purchasetestdomain2.ol",
                        "offering": {
                            "currency": "OLT",
                            "value": "1010000000000000000000"
                        }
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "",
                    "txTo": "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                    "txOriginalValue": ""
                }
            ]
        },
        inputAddress: "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
        expect: [
            {
                "txType": "tx_0000"
            }
        ]
    },
    {
        name: "test10 self re-purchasing",
        input: {
            "txs": [
                {
                    "txHash": "0xc707c1c79d28180550a9fbdba508708738b8775e49a15990254b03ae03b71cb8",
                    "txType": "DOMAIN_PURCHASE",
                    "txFrom": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                    "currentHeight": 4221,
                    "memo": "728c0370-bf32-11ea-bd35-b5f3619cab41",
                    "txDetail": {
                        "account": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "buyer": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                        "name": "purchasetestdomain2.ol",
                        "offering": {
                            "currency": "OLT",
                            "value": "1010000000000000000000"
                        }
                    },
                    "chainID": "OneLedger-6822",
                    "gasPrice": "0.000000001 OLT",
                    "gasUsed": 80000,
                    "totalFee": "0.00008 OLT",
                    "txValue": "(-1010 OLT)",
                    "txTo": "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
                    "txOriginalValue": "1010 OLT"
                }
            ]
        },
        inputAddress: "0ltb7722b1b588fa5c5039969d95fefda2e71ed825a",
        expect: [
            {
                "txType": "tx_4026"
            }
        ]
    }
];

describe("test txTypeCodeMapping", function () {
    txTypeCodeMappingTestCases.forEach(function (testcase) {
        it(testcase.name, function () {
            const re = util.txTypeCodeMapping(testcase.input.txs, testcase.inputAddress);
            console.log("re ", re);
            for (let i = 0; i < re.length; i++) {
                expect(re[i].txType).to.equals(testcase.expect[i].txType)
            }
        })
    })
});

const hexStrToStrTestcases = [
    {
        name: "test 1, no prefix",
        input: "74657374646f6d61696e312e6f6c74",
        expect: "testdomain1.olt"
    },
    {
        name: "test 2, with prefix",
        input: "0x74657374646f6d61696e312e6f6c74",
        expect: "testdomain1.olt"
    },
    {
        name: "test 2, with prefix",
        input: "0x6e616d653d6b6172696d2e6574682c",
        expect: "name=karim.eth,"
    },
    {
        name: "test 3, only prefix",
        input: "0x",
        expect: ""
    },
    {
        name: "test 4, empty",
        input: "",
        expect: ""
    }
];

describe("test parse hex string to string", function () {
    hexStrToStrTestcases.forEach(function (testcase) {
        it(testcase.name, function () {
            const re = util.hexToString(testcase.input);
            console.log("re ", re);
            expect(re).to.equals(testcase.expect)
        })
    })
});

const sendTxTypeDeterminatorTestcase = [
    {
        name :"test1",
        input: false,
        input2: true,
        input3: "100 ETH",
        expect: "tx_4025"
    },
    {
        name :"test2",
        input: false,
        input2: false,
        input3: "100 ETH",
        expect: "tx_4024"
    },
    {
        name :"test3",
        input: false,
        input2: true,
        input3: "100 OLT",
        expect: "tx_4001"
    },
    {
        name :"test4",
        input: false,
        input2: false,
        input3: "100 OLT",
        expect: "tx_4000"
    },
    {
        name :"test5",
        input: true,
        input2: true,
        input3: "100 OLT",
        expect: "tx_4003"
    },
    {
        name :"test6",
        input: true,
        input2: true,
        input3: "100 ETH",
        expect: "tx_4029"
    },
    {
        name :"test7",
        input: true,
        input2: false,
        input3: "100 OLT",
        expect: "tx_4002"
    },
    {
        name :"test8",
        input: true,
        input2: false,
        input3: "100 ETH",
        expect: "tx_4028"
    },
    {
        name :"test9",
        input: undefined,
        input2: undefined,
        input3: "100 ABC",
        expect: "tx_0000"
    },
    {
        name :"test10",
        input: true,
        input2: true,
        input3: "100 ABC",
        expect: "tx_0000"
    },
    {
        name :"test11",
        input: true,
        input2: true,
        input3: "",
        expect: "tx_0000"
    }
];

describe("test send TxType determinator", function () {
    sendTxTypeDeterminatorTestcase.forEach(function (testcase) {
        it(testcase.name, function () {
            const re = util.sendTxTypeDeterminator({isSend2Domain: testcase.input, isFrom: testcase.input2, txValue: testcase.input3});
            console.log("re ", re);
            expect(re).to.equals(testcase.expect)
        })
    })
});
