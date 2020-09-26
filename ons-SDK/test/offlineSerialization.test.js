const requestOffline = require('../ons');
const should = require('should');
const {env, removeCreatedTestFiles} = require("./testUtil");

const createDomainTestCases = [
    {
        name: "test1, should return rawTx",
        input: {
            ownerAddress: "0lt9a59efaa736beb8feaabcbc9ab7c99d4b8c712af",
            beneficiaryAccount: "0lt9a59efaa736beb8feaabcbc9ab7c99d4b8c712af",
            domainName: "AAAbbb123.ol",
            price: {
                currency: "OLT",
                value: "10000"
            },
            uri: "http://127.0.0.1:8080"
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test2, should return false, invalid price value",
        input: {
            ownerAddress: "0lt1234567890123456789012345678901234567890",
            beneficiaryAccount: "0lt1234567890123456789012345678901234567890",
            domainName: "aaaaa.ol",
            price: {
                currency: "OLT",
                value: "12345.7890a"
            }
        },
        inputEnv: env,
        expect: -10002
    },
    {
        name: "test3, should return false, illegal input price",
        input: {
            ownerAddress: "0lt1234567890123456789012345678901234567890",
            beneficiaryAccount: "0lt1234567890123456789012345678901234567890",
            domainName: "AAAbbb123.ol",
            price: {
                currency: "OLT",
                value: 0.00000000000001
            }
        },
        inputEnv: env,
        expect: -10002
    },
    {
        name: "test4, should return rawTx with default gas and gasprice",
        input: {
            ownerAddress: "0lt1234567890123456789012345678901234567890",
            beneficiaryAccount: "0lt1234567890123456789012345678901234567890",
            domainName: "AAAbbb123.ol",
            price: {
                currency: "OLT",
                value: "0.00000000000001"
            },
            uri: "http://127.0.0.1"
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test5, should return error, only support olt address as beneficiaryAccount now",
        input: {
            ownerAddress: "0lt1234567890123456789012345678901234567890",
            beneficiaryAccount: "1JWAxL2trPVJLVXyDf4MdfphGtsrwLcsSQ",
            domainName: "AAAbbb123.btc",
            price: {
                currency: "OLT",
                value: "100.0"
            },
        },
        inputEnv: env,
        expect: -10008
    },
    {
        name: "test6, should return true, uri is not provided",
        input: {
            ownerAddress: "0lt1234567890123456789012345678901234567890",
            beneficiaryAccount: "0lt1234567890123456789012345678901234567890",
            domainName: "AAAbbb123.ol",
            price: {
                currency: "OLT",
                value: "100.0"
            }
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test7, should return true, uri is invalid",
        input: {
            ownerAddress: "0lt1234567890123456789012345678901234567890",
            beneficiaryAccount: "0lt1234567890123456789012345678901234567890",
            domainName: "AAAbbb123.ol",
            price: {
                currency: "OLT",
                value: "100.0"
            },
            uri: "12345"
        },
        inputEnv: env,
        expect: -12027
    },
    {
        name: "test8, should return true, valid gasAdjustment is provided",
        input: {
            ownerAddress: "0lt1234567890123456789012345678901234567890",
            beneficiaryAccount: "0lt1234567890123456789012345678901234567890",
            domainName: "AAAbbb123.ol",
            price: {
                currency: "OLT",
                value: "100.0"
            },
            uri: "http://127.0.0.1",
            gasAdjustment: 100000
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test9, should return error, invalid gasAdjustment is provided",
        input: {
            ownerAddress: "0lt1234567890123456789012345678901234567890",
            beneficiaryAccount: "0lt1234567890123456789012345678901234567890",
            domainName: "AAAbbb123.ol",
            price: {
                currency: "OLT",
                value: "100.0"
            },
            uri: "http://127.0.0.1",
            gasAdjustment: "100000"
        },
        inputEnv: env,
        expect: -12028
    },
    {
        name: "test10, should return error, invalid gasAdjustment is provided",
        input: {
            ownerAddress: "0lt1234567890123456789012345678901234567890",
            beneficiaryAccount: "0lt1234567890123456789012345678901234567890",
            domainName: "AAAbbb123.ol",
            price: {
                currency: "OLT",
                value: "100.0"
            },
            uri: "http://127.0.0.1",
            gasAdjustment: "abcd"
        },
        inputEnv: env,
        expect: -12028
    },
    {
        name: "test11, should return false, invalid platform is provided in the env",
        input: {
            ownerAddress: "0lt1234567890123456789012345678901234567890",
            beneficiaryAccount: "0lt1234567890123456789012345678901234567890",
            domainName: "AAAbbb123.ol",
            price: {
                currency: "OLT",
                value: "100.0"
            },
            uri: "http://127.0.0.1",
            gasAdjustment: 0
        },
        inputEnv: {...env, ...{storeConfig: {platform: "ABC", storeLocation: "./"}}},
        expect: -10008
    },
    {
        name: "test12, should return false, invalid storeLocation is provided in the env",
        input: {
            ownerAddress: "0lt1234567890123456789012345678901234567890",
            beneficiaryAccount: "0lt1234567890123456789012345678901234567890",
            domainName: "AAAbbb123.ol",
            price: {
                currency: "OLT",
                value: "100.0"
            },
            uri: "http://127.0.0.1",
            gasAdjustment: 0
        },
        inputEnv: {...env, ...{storeConfig: {platform: "electron", storeLocation: 123}}},
        expect: -10008
    }
];

describe("create domain tx offline test", function () {
    while (createDomainTestCases.length > 0) {
        const testcase = createDomainTestCases.shift();
        it(testcase.name, async function () {
            const re = await requestOffline.domainCreateTxOffline(testcase.input, testcase.inputEnv).catch(err => {
                console.log(err);
                should.equal(err.error.code, testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log(re);
                should.ok(re.response.rawTx !== "")
            }
        });
    }
});

const updateDomainTestCases = [
    {
        name: "test1, update domain with valid data, should return rawTx",
        input: {
            ownerAddress: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            beneficiaryAccount: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            domainName: "freddy.ol",
            active: true,
            uri: "http://127.0.0.1"
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test2, update domain with valid data but no beneficiaryAccount and active flag is false, should return error code -10000",
        input: {
            ownerAddress: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            beneficiaryAccount: undefined,
            domainName: "FREDDY.ol",
            active: false
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test3, invalid domain name, should return error code -10008",
        input: {
            ownerAddress: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            beneficiaryAccount: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            domainName: "FREDDY",
            active: true
        },
        inputEnv: env,
        expect: -10008
    },
    {
        name: "test4, invalid domain active flag, should return error code -12017",
        input: {
            ownerAddress: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            beneficiaryAccount: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            domainName: "FREDDY.ol",
            active: null
        },
        inputEnv: env,
        expect: -12017
    },
    {
        name: "test5, no uri, should be ok",
        input: {
            ownerAddress: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            beneficiaryAccount: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            domainName: "FREDDY.ol",
            active: true
        },
        inputEnv: env,
        expect: -12017
    },
    {
        name: "test6, valid uri, should be ok",
        input: {
            ownerAddress: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            beneficiaryAccount: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            domainName: "FREDDY.ol",
            active: true,
            uri: "http://127.0.0.1"
        },
        inputEnv: env,
        expect: -12017
    },
    {
        name: "tes7, invalid uri, should be error",
        input: {
            ownerAddress: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            beneficiaryAccount: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            domainName: "FREDDY.ol",
            active: true,
            uri: "127.0.0.1"
        },
        inputEnv: env,
        expect: -12027
    },
    {
        name: "tes8, should be ok without gasAdjustment",
        input: {
            ownerAddress: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            beneficiaryAccount: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            domainName: "FREDDY.ol",
            active: true,
            uri: "http://127.0.0.1"
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "tes9, should be ok with gasAdjustment",
        input: {
            ownerAddress: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            beneficiaryAccount: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            domainName: "FREDDY.ol",
            active: true,
            uri: "http://127.0.0.1",
            gasAdjustment: 11111
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "tes10, should be error with invalid gasAdjustment",
        input: {
            ownerAddress: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            beneficiaryAccount: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            domainName: "FREDDY.ol",
            active: true,
            uri: "http://127.0.0.1",
            gasAdjustment: "11111"
        },
        inputEnv: env,
        expect: -12028
    }
];

describe("update domain tx offline test", function () {
    while (updateDomainTestCases.length > 0) {
        const testcase = updateDomainTestCases.shift();
        it(testcase.name, async function () {
            const re = await requestOffline.domainUpdateTxOffline(testcase.input, testcase.inputEnv).catch(err => {
                console.log(err);
                should.equal(err.error.code, testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log(re);
                should.ok(re.response.rawTx !== "")
            }
        });
    }
});

const renewDomainTestCases = [
    {
        name: "test1, should return rawTx",
        input: {
            ownerAddress: "0lt9a59efaa736beb8feaabcbc9ab7c99d4b8c712af",
            beneficiaryAccount: "0lt9a59efaa736beb8feaabcbc9ab7c99d4b8c712af",
            domainName: "AAAbbb123.ol",
            price: {
                currency: "OLT",
                value: "10000"
            }
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test2, should return false, invalid price value",
        input: {
            ownerAddress: "0lt1234567890123456789012345678901234567890",
            beneficiaryAccount: "0lt1234567890123456789012345678901234567890",
            domainName: "aaaaa.ol",
            price: {
                currency: "OLT",
                value: "12345.7890a"
            }
        },
        inputEnv: env,
        expect: -10002
    },
    {
        name: "test3, should return false, illegal input price",
        input: {
            ownerAddress: "0lt1234567890123456789012345678901234567890",
            beneficiaryAccount: "0lt1234567890123456789012345678901234567890",
            domainName: "AAAbbb123.ol",
            price: {
                currency: "OLT",
                value: 0.00000000000001
            }
        },
        inputEnv: env,
        expect: -10002
    },
    {
        name: "test4, should return rawTx with default gas and gasprice",
        input: {
            ownerAddress: "0lt1234567890123456789012345678901234567890",
            beneficiaryAccount: "0lt1234567890123456789012345678901234567890",
            domainName: "AAAbbb123.ol",
            price: {
                currency: "OLT",
                value: "0.00000000000001"
            },
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test5, should return error, only support olt address as beneficiaryAccount now",
        input: {
            ownerAddress: "0lt1234567890123456789012345678901234567890",
            beneficiaryAccount: "1JWAxL2trPVJLVXyDf4MdfphGtsrwLcsSQ",
            domainName: "AAAbbb123.ol",
            price: {
                currency: "OLT",
                value: "100.0"
            },
        },
        inputEnv: env,
        expect: -10000
    }
];

describe("renew domain tx offline test", function () {
    while (renewDomainTestCases.length > 0) {
        const testcase = renewDomainTestCases.shift();
        it(testcase.name, async function () {
            const re = await requestOffline.domainRenewTxOffline(testcase.input, testcase.inputEnv).catch(err => {
                console.log(err);
                should.equal(err.error.code, testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log(re);
                should.ok(re.response.rawTx !== "")
            }
        });
    }
});

const saleDomainTestCases = [
    {
        name: "test1, sale domain with valid data",
        input: {
            domainName: "freddy.ol",
            ownerAddress: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            price: {
                currency: "OLT",
                value: "100"
            },
            cancelSale: false
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test2, sale domain with valid data",
        input: {
            domainName: "FREDDY.ol",
            ownerAddress: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            price: {
                currency: "OLT",
                value: "100.00"
            },
            cancelSale: false
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test3, sale domain with invalid cancelSale flag",
        input: {
            domainName: "FREDDY.ol",
            ownerAddress: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            price: {
                currency: "OLT",
                value: "100.00"
            },
            cancelSale: null
        },
        inputEnv: env,
        expect: -12018
    }
];

describe("sale domain tx offline test", function () {
    while (saleDomainTestCases.length > 0) {
        const testcase = saleDomainTestCases.shift();
        it(testcase.name, async function () {
            const re = await requestOffline.domainSaleTxOffline(testcase.input, testcase.inputEnv).catch(err => {
                console.log(err);
                should.equal(err.error.code, testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log(re);
                should.ok(re.response.rawTx !== "")
            }
        });
    }
});

const purchaseDomainTestCases = [
    {
        name: "test1",
        input: {
            domainName: "freddy.ol",
            buyerAddress: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            beneficiaryAccount: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            offerAmount: {
                currency: "OLT",
                value: "100"
            }
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test2",
        input: {
            domainName: "freddy.ol",
            buyerAddress: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            beneficiaryAccount: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            offerAmount: {
                currency: "OLT",
                value: "100"
            }
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test3",
        input: {
            domainName: "freddy.ol",
            buyerAddress: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            beneficiaryAccount: "",
            offerAmount: {
                currency: "OLT",
                value: "0.0000011111"
            }
        },
        inputEnv: env,
        expect: -10000
    }
];

describe("purchase domain tx offline test", function () {
    while (purchaseDomainTestCases.length > 0) {
        const testcase = purchaseDomainTestCases.shift();
        it(testcase.name, async function () {
            const re = await requestOffline.domainPurchaseTxOffline(testcase.input, testcase.inputEnv).catch(err => {
                console.log(err);
                should.equal(err.error.code, testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log(re);
                should.ok(re.response.rawTx !== "")
            }
        });
    }
});

const sendToDomainTestCases = [
    {
        name: "test1, send to domain with valid data",
        input: {
            domainName: "freddy.ol",
            fromAccount: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            amount: {
                currency: "OLT",
                value: "100"
            }
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test2, send to domain with valid data but currency is invalid",
        input: {
            domainName: "freddy.ol",
            fromAccount: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            amount: {
                currency: "OETH",
                value: "100"
            }
        },
        inputEnv: env,
        expect: -12029
    }
];

describe("send to domain tx offline test", function () {
    while (sendToDomainTestCases.length > 0) {
        const testcase = sendToDomainTestCases.shift();
        it(testcase.name, async function () {
            const re = await requestOffline.sendToDomainTxOffline(testcase.input, testcase.inputEnv).catch(err => {
                console.log(err);
                should.equal(err.error.code, testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log(re);
                should.ok(re.response.rawTx !== "")
            }
        });
    }

});

const sendToAddrTestCases = [
    {
        name: "test1",
        input: {
            fromAddr: "0lt2a656721b7174232b504084cecde82ee2d0c1454",
            to: "0lt2a656721b7174232b504084cecde82ee2d0c1454",
            amount: {
                currency: "OLT",
                value: "1.0"
            }
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test2",
        input: {
            fromAddr: "0lt2a656721b7174232b504084cecde82ee2d0c1454",
            to: undefined,
            amount: {
                currency: "OLT",
                value: "100.001"
            }
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test3",
        input: {
            fromAddr: "0lt2a656721b7174232b504084cecde82ee2d0c1454",
            to: "0lt2a656721b7174232b504084cecde82ee2d0c1454",
            amount: {
                currency: "OLT",
                value: "100.001"
            }
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test4",
        input: {
            fromAddr: "0lt2a656721b7174232b504084cecde82ee2d0c1454",
            to: "0lt2a656721b7174232b504084cecde82ee2d0c1454",
            amount: {
                currency: "ETH",
                value: "100.001"
            }
        },
        inputEnv: env,
        expect: true
    }
];

describe("send to address tx offline test", function () {
    while (sendToAddrTestCases.length > 0) {
        const testcase = sendToAddrTestCases.shift();
        it(testcase.name, async function () {
            const re = await requestOffline.sendToAddressTxOffline(testcase.input, testcase.inputEnv).catch(err => {
                console.log(err);
                should.equal(err.error.code, testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log(re);
                should.ok(re.response.rawTx !== "")
            }
        });
    }
});

const deleteSubDomainTestCases = [
    {
        name: "test1, should return rawTx",
        input: {
            ownerAddress: "0lt9a59efaa736beb8feaabcbc9ab7c99d4b8c712af",
            domainName: "AAAbbb123.ol"
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test3, should return false, invalid owner address",
        input: {
            ownerAddress: "0lt1234567890123456789",
            domainName: "AAAbbb123.ol"
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test4, should return false, invalid domain name",
        input: {
            ownerAddress: "0lt1234567890123456789012345678901234567890",
            domainName: "AAAbbb123.olt"
        },
        inputEnv: env,
        expect: -10008
    }
];

describe("delete subscription domain tx offline test", function () {
    while (deleteSubDomainTestCases.length > 0) {
        const testcase = deleteSubDomainTestCases.shift();
        it(testcase.name, async function () {
            const re = await requestOffline.domainDeleteSubTxOffline(testcase.input, testcase.inputEnv).catch(err => {
                console.log(err);
                should.equal(err.error.code, testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log(re);
                should.ok(re.response.rawTx !== "")
            }
        });
    }
    after(()=> {
        try {
            const fileList = ["./oneledger_sdk_config.json"];
            removeCreatedTestFiles(fileList)
        } catch (err) {
            should.fail(err, undefined, err)
        }
    })
});
