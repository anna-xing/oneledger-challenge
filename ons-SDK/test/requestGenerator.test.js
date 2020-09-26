const request = require('../requestGenerator');
const RPC = require("../requestSender");
const chai = require('chai');
const expect = chai.expect;
const should = require('should');
const {env, txTypesExpect, removeCreatedTestFiles} = require("./testUtil");
const util = require('../util');
const requestConfig = require("../requestConfig");
const storeFs = require("../store/storeFs");
const sinon = require('sinon');
const sinonChai = require("sinon-chai");

chai.use(sinonChai);

const queryBalanceTestCases = [
    {
        name: "test1 empty address, should return error code -10000",
        input: "",
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test2 non-existed address, should return error code -10000",
        input: "0lt123123123123123",
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test3 existed address, should return resolved",
        input: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        inputEnv: env,
        expect: true
    },
    {
        name: "test4 existed address, should return resolved",
        input: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
        inputEnv: env,
        expect: true
    },
    {
        name: "test5 existed address with default env, should return resolved",
        input: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
        inputEnv: {a: 1},
        expect: true
    },
    {
        name: "test6 existed address with invalid env, should return -12005 invalid requesting  URL",
        input: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
        inputEnv: {a: 1, url: 1},
        expect: -12005
    }
];

describe("query balance test", function () {
    for (let i = 0; i < queryBalanceTestCases.length; i++) {
        it(queryBalanceTestCases[i].name, async function () {
            const re = await request.queryBalanceForAccount(queryBalanceTestCases[i].input, queryBalanceTestCases[i].inputEnv).catch(rej => {
                console.log("rej", rej);
                expect(rej.error.code).to.equals(queryBalanceTestCases[i].expect)
            });
            if (typeof re !== "undefined") {
                console.log("re", re);
                expect(re.response.OLT.balance).to.exist
            }
        }).timeout(20000)
    }
});

const queryCurrencyBalanceTestCases = [
    {
        name: "test1 empty address, should return error code -10000",
        input: {
            address: "",
            currency: "OLT"
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test2 non-existed address, should return error code -10000",
        input: {
            address: "0lt123123123123123",
            currency: "OLT"
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test3 existed address, should return resolved",
        input: {
            address: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            currency: "OLT"
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test4 existed address, wrong currency, should return error",
        input: {
            address: "0lt9de37beab2cf5fe38d7fe3e9e3b90a6a2b05f312",
            currency: "abc"
        },
        inputEnv: env,
        expect: -100503
    },
    {
        name: "test5 no currency, should return resolved with all currency",
        input: {
            address: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test6 existed address with default env, should return resolved",
        input: {
            address: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            currency: "OLT"
        },
        inputEnv: {a: 1},
        expect: true
    },
    {
        name: "test7 existed address with invalid env, should return -12005 invalid requesting  URL",
        input: {
            address: "0lt037a0e76f9300e48c70f87fa271f418fb605eb68",
            currency: "OLT"
        },
        inputEnv: {a: 1, url: 1},
        expect: -12005
    }
];

describe("query currency balance test", function () {
    for (let i = 0; i < queryCurrencyBalanceTestCases.length; i++) {
        it(queryCurrencyBalanceTestCases[i].name, async function () {
            const re = await request.queryCurrencyBalanceForAccount(queryCurrencyBalanceTestCases[i].input, queryCurrencyBalanceTestCases[i].inputEnv).catch(rej => {
                console.log("rej", rej);
                expect(rej.error.code).to.equals(queryCurrencyBalanceTestCases[i].expect)
            });
            if (typeof re !== "undefined") {
                console.log("re", re);
                expect(re.response.OLT.balance).to.exist
            }
        }).timeout(20000)
    }
});

const queryDomainTestCases = [
    {
        name: "test1 query domain by name",
        input: {
            queryDomainType: "ByName",
            domainName: "aaaaaa1.ol"
        },
        expect: -100502
    },
    {
        name: "test2 query domain by owner",
        input: {
            queryDomainType: "ByOwner",
            owner: "0lt213349d365f86c06fe0113082d63c56dd123513b"
        },
        expect: []
    },
    {
        name: "test3 query domain by onsale",
        input: {
            queryDomainType: "OnSale",
            onSale: true
        },
        expect: []
    },
    {
        name: "test4 query domain by invalid query type",
        input: {
            queryDomainType: "aaa",
            onSale: true
        },
        expect: -10007
    },
    {
        name: "test5 query domain by exist name ",
        input: {
            queryDomainType: "ByName",
            domainName: "freddy1.ol"
        },
        expect: -100502
    },
    {
        name: "test6 query domain by invalid domain extension",
        input: {
            queryDomainType: "ByName",
            domainName: "freddy1.abc"
        },
        expect: -10008
    },
    {
        name: "test7 query domain by invalid domain onSale flag",
        input: {
            queryDomainType: "OnSale",
            onSale: ""
        },
        expect: -12019
    },
    {
        name: "test8 query domain by domain onSale flag on, default env",
        input: {
            queryDomainType: "OnSale",
            onSale: true
        },
        inputEnv: {a: "abc"},
        expect: []
    },
    {
        name: "test9 query domain by domain onSale flag on, invalid env, should get error : invalid requesting  URL",
        input: {
            queryDomainType: "OnSale",
            onSale: true
        },
        inputEnv: {a: "abc", url: "127.0.0.1"},
        expect: -12005
    },
    {
        name: "test10 query domain by domain onSale flag on, valid env, should get error : invalid full node URL because url is valid but local node is not running",
        input: {
            queryDomainType: "OnSale",
            onSale: true
        },
        inputEnv: {a: "abc", url: "http://127.0.0.1:8080"},
        expect: -12005
    },
    {
        name: "test11 query domain by domain beneficiary account, valid env, should get error : invalid full node URL because url is valid but local node is not running",
        input: {
            queryDomainType: "ByBeneficiaryAccount",
            beneficiaryAccount: "0lt213349d365f86c06fe0113082d63c56dd123513b"
        },
        inputEnv: env,
        expect: []
    },
    {
        name: "test12, query domain by name with .ol extension",
        input: {
            queryDomainType: "ByName",
            domainName: "testdomain1.ol"
        },
        inputEnv: env,
        expect: -100502
    },
    {
        name: "test13, query parent domain by owner",
        input: {
            queryDomainType: "ParentDomainByOwner",
            owner: "0lt213349d365f86c06fe0113082d63c56dd123513b"
        },
        inputEnv: env,
        expect: []
    },
    {
        name: "test14, query parent domain by owner, invalid env",
        input: {
            queryDomainType: "ParentDomainByOwner",
            owner: "0lt213349d365f86c06fe0113082d63c56dd123513b"
        },
        inputEnv: {a: "abc", url: "127.0.0.1"},
        expect: -12005
    },
    {
        name: "test15, query parent domain by owner, invalid owner address",
        input: {
            queryDomainType: "ParentDomainByOwner",
            owner: "12345"
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test16, query sub domain by name",
        input: {
            queryDomainType: "SubDomainByName",
            domainName: "testdomain1.ol"
        },
        inputEnv: env,
        expect: -100502
    },
    {
        name: "test17, query sub_sub domain by a sub domain's name",
        input: {
            queryDomainType: "SubDomainByName",
            domainName: "sub.abc.ol"
        },
        inputEnv: env,
        expect: -100502
    },
    {
        name: "test18, query sub domain by name, invalid env",
        input: {
            queryDomainType: "SubDomainByName",
            domainName: "testdomain1.ol"
        },
        inputEnv: {a: "abc", url: "127.0.0.1"},
        expect: -12005
    },
    {
        name: "test19, query sub domain by name, invalid name",
        input: {
            queryDomainType: "SubDomainByName",
            domainName: "12345"
        },
        inputEnv: env,
        expect: -10008
    }
];

describe("query domains test", function () {
    for (let i = 0; i < queryDomainTestCases.length; i++) {
        it(queryDomainTestCases[i].name, async function () {
            const re = await request.queryDomains(queryDomainTestCases[i].input, queryDomainTestCases[i].inputEnv).catch(rej => {
                console.log("REJ", rej);
                expect(rej.error.code).to.equals(queryDomainTestCases[i].expect)
            });
            if (typeof re !== "undefined") {
                console.log("RE", re);
                if (re.response.length === 0) {
                    expect(re.response).deep.equals(queryDomainTestCases[i].expect)
                }
            }
        }).timeout(20000)
    }
    after(() => {
        try {
            const fileList = ["./oneledger_sdk_config.json"];
            removeCreatedTestFiles(fileList)
        } catch (err) {
            should.fail(err, undefined, err)
        }
    })
});

const broadcastTestCases = [
    {
        name: "test1 By Sync",
        input: {
            broadcastType: "Sync",
            rawTx:
                "dgpAALPD7DNO0q0KFAN6Dnb5MA5Ixw+H+icfQY+2BetoEhQDeg52+TAOSMcPh/onH0GPtgXraBoKZnJlZGR5Lm9sdBIMCggKA29sdBIBMRABIiQzOWNjNzAxMC05NmE3LTExZTktYWJhNS1hY2RlNDgwMDExMjI=",
            signature: 'dwzYuPpiB6+uxBI+mLK3inaklBW3mwcxqX5QzMloSzmBPfXS6SRNK4Nw9GszUji5RVo5RXy9MU2EYcceu5wYBg==',
            publicKey: {
                keyType: "ed25519",
                data: "32J2390VN123NVVdfgvsaqdkfn32vwne324bvmn3Nvnm"
            },
            url: env.url
        },
        expect: -32600
    },
    {
        name: "test2 By Async",
        input: {
            broadcastType: "Async",
            rawTx:
                "dgpAALPD7DNO0q0KFAN6Dnb5MA5Ixw+H+icfQY+2BetoEhQDeg52+TAOSMcPh/onH0GPtgXraBoKZnJlZGR5Lm9sdBIMCggKA29sdBIBMRABIiQzOWNjNzAxMC05NmE3LTExZTktYWJhNS1hY2RlNDgwMDExMjI=",
            signature: "",
            publicKey: {
                keyType: "ed25519",
                data: "32J2390VN123NVVdfgvsaqdkfn32vwne324bvmn3Nvnm"
            }
        },
        expect: -32600
    },

    {
        name: "test3 By invalid type",
        input: {
            broadcastType: "abcde",
            rawTx:
                "dgpAALPD7DNO0q0KFAN6Dnb5MA5Ixw+H+icfQY+2BetoEhQDeg52+TAOSMcPh/onH0GPtgXraBoKZnJlZGR5Lm9sdBIMCggKA29sdBIBMRABIiQzOWNjNzAxMC05NmE3LTExZTktYWJhNS1hY2RlNDgwMDExMjI=",
            signature: "",
            publicKey: {
                keyType: "ed25519",
                data: "32J2390VN123NVVdfgvsaqdkfn32vwne324bvmn3Nvnm"
            }
        },
        expect: -10006
    },
    {
        name: "test4 Sync test with real data, should reach to code error -300103",
        input: {
            broadcastType: 'Sync',
            rawTx:
                'eyJ0eF90eXBlIjoyLCJ0eF9kYXRhIjoiZXlKUGQyNWxjaUk2SWpCNFlUTmlNR1V4TWpRMVlUZGpNMlJrTURNd1lqbG1OMkV6TkRJMk16UXpOamRrWlRFek4yUmhPQ0lzSWtGalkyOTFiblFpT2lJd2VHRXpZakJsTVRJME5XRTNZek5rWkRBek1HSTVaamRoTXpReU5qTTBNelkzWkdVeE16ZGtZVGdpTENKT1lXMWxJam9pZEdWemRHUnZiV0ZwYmpFeElpd2lVSEpwWTJVaU9uc2lZM1Z5Y21WdVkza2lPaUpQVEZRaUxDSjJZV3gxWlNJNklqRXdNREF3TURBd01EQXdNREF3TURBd01EQXdNREFpZlgwPSIsImZlZSI6eyJQcmljZSI6eyJjdXJyZW5jeSI6Ik9MVCIsInZhbHVlIjoiMTAwMDAwMDAwMDAwMDAwMDAwMCJ9LCJHYXMiOjF9LCJtZW1vIjoiNzk5YTFhMDQtYWNkMS0xMWU5LWE5OGMtZjIxODk4NWVkNTVkIn0=',
            signature:
                'oyM5mtK7Aa2YrHgBkdM3Ivlu6guQsOhnKsaa8CrKH7LnsF4wjCInnfvBodC7Nd/iiDklPvqi+8yL02zZcGcNAA==',
            publicKey:
                {
                    keyType: 'ed25519',
                    data: 'YJ1nBlQGoI+V+NqsE5pcB8bHBblRmvIY/DznzD2bBDs='
                }
        },
        expect: -300103
    },
    {
        name: "test5 sync test with real data, invalid env, should get error : invalid requesting  URL",
        input: {
            broadcastType: 'Sync',
            rawTx:
                'eyJ0eF90eXBlIjoyLCJ0eF9kYXRhIjoiZXlKUGQyNWxjaUk2SWpCNFlUTmlNR1V4TWpRMVlUZGpNMlJrTURNd1lqbG1OMkV6TkRJMk16UXpOamRrWlRFek4yUmhPQ0lzSWtGalkyOTFiblFpT2lJd2VHRXpZakJsTVRJME5XRTNZek5rWkRBek1HSTVaamRoTXpReU5qTTBNelkzWkdVeE16ZGtZVGdpTENKT1lXMWxJam9pZEdWemRHUnZiV0ZwYmpFeElpd2lVSEpwWTJVaU9uc2lZM1Z5Y21WdVkza2lPaUpQVEZRaUxDSjJZV3gxWlNJNklqRXdNREF3TURBd01EQXdNREF3TURBd01EQXdNREFpZlgwPSIsImZlZSI6eyJQcmljZSI6eyJjdXJyZW5jeSI6Ik9MVCIsInZhbHVlIjoiMTAwMDAwMDAwMDAwMDAwMDAwMCJ9LCJHYXMiOjF9LCJtZW1vIjoiNzk5YTFhMDQtYWNkMS0xMWU5LWE5OGMtZjIxODk4NWVkNTVkIn0=',
            signature:
                'oyM5mtK7Aa2YrHgBkdM3Ivlu6guQsOhnKsaa8CrKH7LnsF4wjCInnfvBodC7Nd/iiDklPvqi+8yL02zZcGcNAA==',
            publicKey:
                {
                    keyType: 'ed25519',
                    data: 'YJ1nBlQGoI+V+NqsE5pcB8bHBblRmvIY/DznzD2bBDs='
                }
        },
        inputEnv: {url: "123abc"},
        expect: -12005
    },
    {
        name: "test6 sync test with real data, valid env but local node is not running, should get error : invalid full node URL",
        input: {
            broadcastType: 'Sync',
            rawTx:
                'eyJ0eF90eXBlIjoyLCJ0eF9kYXRhIjoiZXlKUGQyNWxjaUk2SWpCNFlUTmlNR1V4TWpRMVlUZGpNMlJrTURNd1lqbG1OMkV6TkRJMk16UXpOamRrWlRFek4yUmhPQ0lzSWtGalkyOTFiblFpT2lJd2VHRXpZakJsTVRJME5XRTNZek5rWkRBek1HSTVaamRoTXpReU5qTTBNelkzWkdVeE16ZGtZVGdpTENKT1lXMWxJam9pZEdWemRHUnZiV0ZwYmpFeElpd2lVSEpwWTJVaU9uc2lZM1Z5Y21WdVkza2lPaUpQVEZRaUxDSjJZV3gxWlNJNklqRXdNREF3TURBd01EQXdNREF3TURBd01EQXdNREFpZlgwPSIsImZlZSI6eyJQcmljZSI6eyJjdXJyZW5jeSI6Ik9MVCIsInZhbHVlIjoiMTAwMDAwMDAwMDAwMDAwMDAwMCJ9LCJHYXMiOjF9LCJtZW1vIjoiNzk5YTFhMDQtYWNkMS0xMWU5LWE5OGMtZjIxODk4NWVkNTVkIn0=',
            signature:
                'oyM5mtK7Aa2YrHgBkdM3Ivlu6guQsOhnKsaa8CrKH7LnsF4wjCInnfvBodC7Nd/iiDklPvqi+8yL02zZcGcNAA==',
            publicKey:
                {
                    keyType: 'ed25519',
                    data: 'YJ1nBlQGoI+V+NqsE5pcB8bHBblRmvIY/DznzD2bBDs='
                }
        },
        inputEnv: {url: "http://127.0.0.1:8080", a: 1, b: ""},
        expect: -12005
    },
    {
        name: "test7 TxCommitMtSig test with real data, invalid signatures array",
        input: {
            broadcastType: 'TxCommitMtSig',
            rawTx:
                'eyJ0eF90eXBlIjoyLCJ0eF9kYXRhIjoiZXlKUGQyNWxjaUk2SWpCNFlUTmlNR1V4TWpRMVlUZGpNMlJrTURNd1lqbG1OMkV6TkRJMk16UXpOamRrWlRFek4yUmhPQ0lzSWtGalkyOTFiblFpT2lJd2VHRXpZakJsTVRJME5XRTNZek5rWkRBek1HSTVaamRoTXpReU5qTTBNelkzWkdVeE16ZGtZVGdpTENKT1lXMWxJam9pZEdWemRHUnZiV0ZwYmpFeElpd2lVSEpwWTJVaU9uc2lZM1Z5Y21WdVkza2lPaUpQVEZRaUxDSjJZV3gxWlNJNklqRXdNREF3TURBd01EQXdNREF3TURBd01EQXdNREFpZlgwPSIsImZlZSI6eyJQcmljZSI6eyJjdXJyZW5jeSI6Ik9MVCIsInZhbHVlIjoiMTAwMDAwMDAwMDAwMDAwMDAwMCJ9LCJHYXMiOjF9LCJtZW1vIjoiNzk5YTFhMDQtYWNkMS0xMWU5LWE5OGMtZjIxODk4NWVkNTVkIn0=',
            signature:
                'oyM5mtK7Aa2YrHgBkdM3Ivlu6guQsOhnKsaa8CrKH7LnsF4wjCInnfvBodC7Nd/iiDklPvqi+8yL02zZcGcNAA==',
            publicKey:
                {
                    keyType: 'ed25519',
                    data: 'YJ1nBlQGoI+V+NqsE5pcB8bHBblRmvIY/DznzD2bBDs='
                }
        },
        inputEnv: {url: "http://127.0.0.1:8080/jsonrpc", a: 1, b: ""},
        expect: -14010
    },
    {
        name: "test8 TxCommitMtSig test with real data, invalid signatures array",
        input: {
            broadcastType: 'TxCommitMtSig',
            rawTx:
                'eyJ0eF90eXBlIjoyLCJ0eF9kYXRhIjoiZXlKUGQyNWxjaUk2SWpCNFlUTmlNR1V4TWpRMVlUZGpNMlJrTURNd1lqbG1OMkV6TkRJMk16UXpOamRrWlRFek4yUmhPQ0lzSWtGalkyOTFiblFpT2lJd2VHRXpZakJsTVRJME5XRTNZek5rWkRBek1HSTVaamRoTXpReU5qTTBNelkzWkdVeE16ZGtZVGdpTENKT1lXMWxJam9pZEdWemRHUnZiV0ZwYmpFeElpd2lVSEpwWTJVaU9uc2lZM1Z5Y21WdVkza2lPaUpQVEZRaUxDSjJZV3gxWlNJNklqRXdNREF3TURBd01EQXdNREF3TURBd01EQXdNREFpZlgwPSIsImZlZSI6eyJQcmljZSI6eyJjdXJyZW5jeSI6Ik9MVCIsInZhbHVlIjoiMTAwMDAwMDAwMDAwMDAwMDAwMCJ9LCJHYXMiOjF9LCJtZW1vIjoiNzk5YTFhMDQtYWNkMS0xMWU5LWE5OGMtZjIxODk4NWVkNTVkIn0=',
            signature:
                'oyM5mtK7Aa2YrHgBkdM3Ivlu6guQsOhnKsaa8CrKH7LnsF4wjCInnfvBodC7Nd/iiDklPvqi+8yL02zZcGcNAA==',
            publicKey:
                {
                    keyType: 'ed25519',
                    data: 'YJ1nBlQGoI+V+NqsE5pcB8bHBblRmvIY/DznzD2bBDs='
                },
            otherSignature: [
                {
                    signature: 'oyM5mtK7Aa2YrHgBkdM3Ivlu6guQsOhnKsaa8CrKH7LnsF4wjCInnfvBodC7Nd/iiDklPvqi+8yL02zZcGcNAA==',
                    publicKey: {
                        keyType: 'ed25519',
                        data: 'YJ1nBlQGoI+V+NqsE5pcB8bHBblRmvIY/DznzD2bBDs='
                    }
                }
            ]
        },
        inputEnv: {url: "http://127.0.0.1:8080/jsonrpc", a: 1, b: ""},
        expect: -20005
    }
];

describe("broadcast test", function () {
    for (let i = 0; i < broadcastTestCases.length; i++) {
        // const validEnvObj = ()
        it(broadcastTestCases[i].name, async function () {
            const re = await request.broadcastTx(broadcastTestCases[i].input, broadcastTestCases[i].inputEnv).catch(rej => {
                console.log("REJ", rej);
                expect(rej.error.code).to.equals(broadcastTestCases[i].expect)
            });
            if (typeof re !== "undefined") {
                console.log("RE", re);
                expect(res.response).to.exist
            }
        }).timeout(20000);
    }
});

const queryDomainPriceRateTestcases = [
    {
        name: "test1",
        input: env.url,
        expect: true
    },
    {
        name: "test1",
        input: {},
        expect: -12005
    }
];

describe("query domain price rate test", function () {
    while (queryDomainPriceRateTestcases.length > 0) {
        const testcase = queryDomainPriceRateTestcases.shift();
        it(testcase.name, async function () {
            const re = await request.queryDomainPriceRate({url: testcase.input}).catch(rej => {
                console.log("REJ", rej);
                expect(rej.error.code).to.equals(testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log("re", re);
                expect(re.response).to.exist
            }
        });
    }
});

const queryDomainBasePriceTestcases = [
    {
        name: "test1",
        input: env.url,
        expect: true
    },
    {
        name: "test2",
        input: {},
        expect: -12005
    }
];

describe("query domain creation base price test", function () {
    while (queryDomainBasePriceTestcases.length > 0) {
        const testcase = queryDomainBasePriceTestcases.shift();
        it(testcase.name, async function () {
            const re = await request.queryDomainCreationBasePrice({url: testcase.input}).catch(rej => {
                console.log("REJ", rej);
                expect(rej.error.code).to.equals(testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log("re", re);
                expect(re.response).to.exist
            }
        });
    }
});

const domainTotalPriceTestcases = [
    {
        name: "test1, valid block number",
        input: 100,
        inputEnv: env,
        expect: "0.01"
    },
    {
        name: "test2, valid block number",
        input: 20,
        inputEnv: env,
        expect: "0.002"
    },
    {
        name: "test3, valid block number",
        input: 5000000,
        inputEnv: env,
        expect: "500"
    },
    {
        name: "test4, empty string",
        input: "",
        inputEnv: env,
        expect: -10010
    },
    {
        name: "test5, string but not a number",
        input: "abde",
        inputEnv: env,
        expect: -10010
    },
    {
        name: "test6, negative string",
        input: "-1",
        inputEnv: env,
        expect: -10010
    },
    {
        name: "test7, positive int",
        input: 10,
        inputEnv: env,
        expect: "0.001"
    },
    {
        name: "test8, zero",
        input: 0,
        inputEnv: env,
        expect: "0"
    },
    {
        name: "test9, negative int",
        input: -20,
        inputEnv: env,
        expect: -10010
    },
    {
        name: "test10, positive float",
        input: 20.02,
        inputEnv: env,
        expect: -10010
    },
    {
        name: "test11, negative float",
        input: -20.02,
        inputEnv: env,
        expect: -10010
    },
    {
        name: "test12, return subdomain creation base price",
        input: 20,
        inputEnv: env,
        expect: "0.002"
    }
];

describe("calculate domain total price test", function () {
    while (domainTotalPriceTestcases.length > 0) {
        const testcase = domainTotalPriceTestcases.shift();
        it(testcase.name, async function () {
            const re = await request.calculateDomainPrice(testcase.input, testcase.inputEnv).catch(rej => {
                console.log("REJ", rej);
                expect(rej.error.code).to.equals(testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log("re", re);
                expect(re.response.totalPrice).to.equals(testcase.expect);
            }
        });
    }
});

const queryGasPriceTestcases = [
    {
        name: "test1",
        input: env,
        expect: true
    },
    {
        name: "test2",
        input: {url: "123"},
        expect: -12005
    }
];

describe("query gas price test", function () {
    while (queryGasPriceTestcases.length > 0) {
        const testcase = queryGasPriceTestcases.shift();
        it(testcase.name, async function () {
            const re = await request.queryGasPrice(testcase.input).catch(rej => {
                console.log("REJ", rej);
                expect(rej.error.code).to.equals(testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log("re", re);
                expect(re.response).to.exist
            }
        });
    }
});

const getAbsoluteMinDomainCreationPriceTestcases = [
    {
        name: "test1",
        input: env,
        expect: true
    },
    {
        name: "test2",
        input: {url: "123"},
        expect: -12005
    }
];

describe("get domain creation min price test", function () {
    while (getAbsoluteMinDomainCreationPriceTestcases.length > 0) {
        const testcase = getAbsoluteMinDomainCreationPriceTestcases.shift();
        it(testcase.name, async function () {
            const re = await request.getAbsoluteMinDomainCreationPrice(testcase.input).catch(rej => {
                console.log("REJ", rej);
                expect(rej.error.code).to.equals(testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log("re", re);
                expect(re.response).to.exist
            }
        });
    }
});

const queryTrackerTestcases = [
    {
        name: "test1, invalid chainType",
        inputTrackerName: "0x2b7803bc372d50382f7dd329b33f047a43548bb3deb062cd04326f9bbc326a6e",
        inputChainType: null,
        inputEnv: env,
        expect: -12022
    },
    {
        name: "test2, should use default chainType but tracker not exist",
        inputTrackerName: "0x2b7803bc372d50382f7dd329b33f047a43548bb3deb062cd04326f9bbc326a6e",
        inputChainType: undefined,
        inputEnv: env,
        expect: -600101
    },
    {
        name: "test3, invalid chainType",
        inputTrackerName: "0x2b7803bc372d50382f7dd329b33f047a43548bb3deb062cd04326f9bbc326a6e",
        inputChainType: 1,
        inputEnv: env,
        expect: -12022
    },
    {
        name: "test4, invalid chainType",
        inputTrackerName: "0x2b7803bc372d50382f7dd329b33f047a43548bb3deb062cd04326f9bbc326a6e",
        inputChainType: "",
        inputEnv: env,
        expect: -12022
    },
    {
        name: "test5, invalid chainType",
        inputTrackerName: "0x2b7803bc372d50382f7dd329b33f047a43548bb3deb062cd04326f9bbc326a6e",
        inputChainType: "ABC",
        inputEnv: env,
        expect: -12022
    },
    {
        name: "test6, should return error, invalid tracker name",
        inputTrackerName: "123",
        inputChainType: "ETH",
        inputEnv: env,
        expect: -10010
    },
    {
        name: "test7, should return error, invalid tracker name",
        inputTrackerName: "0x2b2a05731a72d4a96d41879d25d908c051d832cd3aead8e27b1593514e68c00",
        inputChainType: "ETH",
        inputEnv: env,
        expect: -10010
    },
    {
        name: "test8, valid testcase, but since tracker not exist should return 600101",
        inputTrackerName: "0x2b2a05731a72d4a96d41879d25d908c051d832cd3aead8e27b1593514e68c00b",
        inputChainType: "ETH",
        inputEnv: env,
        expect: -600101
    },
    {
        name: "test9, should return error with empty payload",
        inputTrackerName: undefined,
        inputChainType: undefined,
        inputEnv: undefined,
        expect: -10010
    }
];

describe("query tracker test", function () {
    while (queryTrackerTestcases.length > 0) {
        const testcase = queryTrackerTestcases.shift();
        it(testcase.name, async function () {
            const payload = {
                trackerName: testcase.inputTrackerName,
                chainType: testcase.inputChainType,
            };
            const re = await request.queryTracker(payload, testcase.inputEnv).catch(rej => {
                console.log("REJ", rej);
                expect(rej.error.code).to.equals(testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log("re", re);
                expect(re.response).to.exist
            }
        });
    }
});

const queryTxTypesTestcases = [
    {
        name: "test, query all tx types",
        inputEnv: env,
        expect: txTypesExpect
    },
];

describe("query txtypes test", function () {
    while (queryTxTypesTestcases.length > 0) {
        const testcase = queryTxTypesTestcases.shift();
        it(testcase.name, async function () {
            const re = await request.queryTxTypes(testcase.inputEnv).catch(rej => {
                console.log("REJ", rej);
            });
            console.log("re: ", re.response);
            expect(re.response.txTypes).to.deep.equals(testcase.expect);
        });
    }
});

const updateSDKConfigTestcases = [
    {
        name: "test1, add new config",
        inputEnv: env,
        defaultData: undefined,
        expect: txTypesExpect
    },
    {
        name: "test2, replace an existing outdated config",
        inputEnv: env,
        defaultData: {"txTypes": [{"TxTypeNum": 1, "TxTypeString": "SEND"}]},
        expect: txTypesExpect
    },
];

describe("update SDK Config test", function () {
    let fsStore;
    let storeInitOpt;
    while (updateSDKConfigTestcases.length > 0) {
        const testcase = updateSDKConfigTestcases.shift();
        it(testcase.name, async function () {
            //setup config file with defaultData per case
            storeInitOpt = {
                storeName: requestConfig.sdkConfigFileName,
                defaultData: testcase.defaultData
            };
            try {
                fsStore = new storeFs(storeInitOpt)
            } catch (err) {
                should.fail(err, undefined, "should be no error : ", err)
            }

            console.log("initial config for this test case: ", fsStore.data);


            await request.updateSDKConfig(testcase.inputEnv).catch(rej => {
                console.log("REJ", rej);
                expect(rej).to.not.exist;
            });
            console.log("check1");
            //test to see if any problem when loading the updated config
            const configEnv = {
                platform: env.storeConfig.platform,
                storeName: requestConfig.sdkConfigFileName,
                storeLocation: env.storeConfig.storeLocation,
                defaultData: testcase.defaultData
            };
            console.log("configEnv: ", configEnv);
            const re = util.loadStoreByKey(configEnv, 'txTypes');
            console.log("re: ", re);
            expect(re).deep.equals(testcase.expect);
        });
    }
    afterEach(function () {
        try {
            const fileList = ["./oneledger_sdk_config.json"];
            removeCreatedTestFiles(fileList)
        } catch (err) {
            should.fail(err, undefined, err)
        }
    })
});

const queryProposalRPCMockTestcases = [
    {
        name: "test 2, query by proposalID",
        input: {
            queryProposalType: "ByProposalID",
            proposalID: "id",
            state: "",
            proposer: "",
            proposalType: ""
        },
        inputEnv: env,
        rpcCalledWith: {
            method: 'POST',
            headers:
                {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
            body:
                {
                    jsonrpc: '2.0',
                    method: 'query.ListProposal',
                    id: 1,
                    params:
                        {
                            proposalId: "id"
                        }
                },
            json: true,
            timeout: 3000,
            url: 'http://127.0.0.1:26602/jsonrpc'
        },
        expect: Promise.resolve([])
    },
    {
        name: "test 3, query by state",
        input: {
            queryProposalType: "ByProposalState",
            proposalID: "",
            state: 0x31,
            proposer: "",
            proposalType: ""
        },
        inputEnv: env,
        rpcCalledWith: {
            method: 'POST',
            headers:
                {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
            body:
                {
                    jsonrpc: '2.0',
                    method: 'query.ListProposals',
                    id: 1,
                    params:
                        {
                            state: 0x31,
                            proposer: "",
                            proposalType: 0xEE
                        }
                },
            json: true,
            timeout: 3000,
            url: 'http://127.0.0.1:26602/jsonrpc'
        },
        expect: Promise.resolve([])
    },
    {
        name: "test 4, query by proposer",
        input: {
            queryProposalType: "ByProposer",
            proposalID: "",
            state: "",
            proposer: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            proposalType: ""
        },
        inputEnv: env,
        rpcCalledWith: {
            method: 'POST',
            headers:
                {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
            body:
                {
                    jsonrpc: '2.0',
                    method: 'query.ListProposals',
                    id: 1,
                    params:
                        {
                            state: 0xEE,
                            proposer: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
                            proposalType: 0xEE
                        }
                },
            json: true,
            timeout: 3000,
            url: 'http://127.0.0.1:26602/jsonrpc'
        },
        expect: Promise.resolve([])
    },
    {
        name: "test 5, query by proposalType",
        input: {
            queryProposalType: "ByProposalType",
            proposalID: "",
            state: "",
            proposer: "",
            proposalType: 0x20
        },
        inputEnv: env,
        rpcCalledWith: {
            method: 'POST',
            headers:
                {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
            body:
                {
                    jsonrpc: '2.0',
                    method: 'query.ListProposals',
                    id: 1,
                    params:
                        {
                            state: 0xEE,
                            proposer: "",
                            proposalType: 0x20
                        }
                },
            json: true,
            timeout: 3000,
            url: 'http://127.0.0.1:26602/jsonrpc'
        },
        expect: Promise.resolve([])
    },
    {
        name: "test 6, query all proposals",
        input: {
            queryProposalType: "AllProposals"
        },
        inputEnv: env,
        rpcCalledWith: {
            method: 'POST',
            headers:
                {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
            body:
                {
                    jsonrpc: '2.0',
                    method: 'query.ListProposals',
                    id: 1,
                    params:
                        {
                            state: 0xEE,
                            proposer: "",
                            proposalType: 0xEE
                        }
                },
            json: true,
            timeout: 3000,
            url: 'http://127.0.0.1:26602/jsonrpc'
        },
        expect: Promise.resolve([])
    },
    {
        name: "test 7, query proposals by multiple conditions",
        input: {
            queryProposalType: "MixConditions",
            state: 0x31,
            proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            proposalType: 0x22
        },
        inputEnv: env,
        rpcCalledWith: {
            method: 'POST',
            headers:
                {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
            body:
                {
                    jsonrpc: '2.0',
                    method: 'query.ListProposals',
                    id: 1,
                    params:
                        {
                            state: 0x31,
                            proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
                            proposalType: 0x22
                        }
                },
            json: true,
            timeout: 3000,
            url: 'http://127.0.0.1:26602/jsonrpc'
        },
        expect: Promise.resolve([])
    },
    {
        name: "test 8, query proposals by multiple conditions",
        input: {
            queryProposalType: "MixConditions",
            state: undefined,
            proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            proposalType: 0x22
        },
        inputEnv: env,
        rpcCalledWith: {
            method: 'POST',
            headers:
                {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
            body:
                {
                    jsonrpc: '2.0',
                    method: 'query.ListProposals',
                    id: 1,
                    params:
                        {
                            state: 238,
                            proposer: '0lt52901e9603f9d504049c9d79132e3e9c2820b6a4',
                            proposalType: 34
                        }
                },
            json: true,
            timeout: 3000,
            url: 'http://127.0.0.1:26602/jsonrpc'
        },
        expect: Promise.resolve([])
    },
];

describe("query proposal RPC mock test", function () {
    let stub;
    beforeEach(() => {
        stub = sinon.stub(RPC, "returnPromise")
    })
    for (let i = 0; i < queryProposalRPCMockTestcases.length; i++) {
        it(queryProposalRPCMockTestcases[i].name, async function () {
            stub.returns(queryProposalRPCMockTestcases[i].expect)
            await request.queryProposal(queryProposalRPCMockTestcases[i].input, queryProposalRPCMockTestcases[i].inputEnv)
            sinon.assert.calledWith(stub, queryProposalRPCMockTestcases[i].rpcCalledWith)
        })
    }
    afterEach(() => {
        stub.restore()
    })
})

const queryProposalInputCheckTestcases = [
    {
        name: "test 1, invalid query type",
        input: {
            queryProposalType: "ByProposalXXX",
            proposalID: "",
            state: "",
            proposer: "",
            proposalType: ""
        },
        inputEnv: env,
        expect: -14004
    },
    {
        name: "test 9, query proposals by multiple conditions, invalid proposal state",
        input: {
            queryProposalType: "MixConditions",
            state: "something_not_valid",
            proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            proposalType: 0x22
        },
        inputEnv: env,
        expect: -14008
    },
    {
        name: "test 10, query proposals by multiple conditions, invalid proposal type",
        input: {
            queryProposalType: "MixConditions",
            state: null,
            proposer: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4",
            proposalType: 0x55
        },
        inputEnv: env,
        expect: -14003
    }
];

describe("query proposal test input check", function () {
    for (let i = 0; i < queryProposalInputCheckTestcases.length; i++) {
        it(queryProposalInputCheckTestcases[i].name, async function () {
            await request.queryProposal(queryProposalInputCheckTestcases[i].input, queryProposalInputCheckTestcases[i].inputEnv).catch(rej => {
                console.log("REJ", rej);
                expect(rej.error.code).to.equals(queryProposalInputCheckTestcases[i].expect)
            })
        })
    }
})

const queryProposalOptionsTestcases = [
    {
        name: "test1",
        input: env,
        expect: true
    },
    {
        name: "test2",
        input: {url: "123"},
        expect: -12005
    }
];

describe("get proposal options test", function () {
    while (queryProposalOptionsTestcases.length > 0) {
        const testcase = queryProposalOptionsTestcases.shift();
        it(testcase.name, async function () {
            const re = await request.queryProposalOptions(testcase.input).catch(rej => {
                console.log("REJ", rej);
                expect(rej.error.code).to.equals(testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log("re", re);
                expect(re.response).to.exist
            }
        });
    }
});

const calculateProposalInfoTestcases = [
    {
        name: "test1",
        input: 0x20,
        inputEnv: env,
        expect: true
    },
    {
        name: "test2",
        input: 0x21,
        inputEnv: {url: "123"},
        expect: -12005
    },
    {
        name: "test3",
        input: 0x21,
        inputEnv: env,
        expect: true
    },
    {
        name: "test4",
        input: 0x22,
        inputEnv: env,
        expect: true
    },
];

describe("calculate proposal info test", function () {
    while (calculateProposalInfoTestcases.length > 0) {
        const testcase = calculateProposalInfoTestcases.shift();
        it(testcase.name, async function () {
            const re = await request.calculateProposalInfo(testcase.input, testcase.inputEnv).catch(rej => {
                console.log("REJ", rej);
                expect(rej.error.code).to.equals(testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log("re", re);
                expect(re).to.exist
            }
        });
    }
});

const queryFundsTestcases = [
    {
        name: "test1",
        input: {
            proposalID: "a75614e4a81733387cbc92d6580d19e57f45302f4c290d36118b1457352e1979",
            funder: "0ltff019235583a5e3f2965169681a5f2fceb6dd15c"
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test2, empty proposal id",
        input: {
            proposalID: "",
            funder: "0lt52901e9603f9d504049c9d79132e3e9c2820b6a4"
        },
        inputEnv: env,
        expect: -14001
    },
    {
        name: "test3, wrong funder address",
        input: {
            proposalID: "a75614e4a81733387cbc92d6580d19e57f45302f4c290d36118b1457352e1979",
            funder: "0x52901e9603f9d504049c9d79132e3e9c2820b6a4"
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test4, wrong funder address",
        input: {
            proposalID: "a75614e4a81733387cbc92d6580d19e57f45302f4c290d36118b1457352e1979",
            funder: "0lt52901e96"
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test5, empty funder address",
        input: {
            proposalID: "a75614e4a81733387cbc92d6580d19e57f45302f4c290d36118b1457352e1979",
            funder: ""
        },
        inputEnv: env,
        expect: -10000
    }
];

describe("query funds test", function () {
    while (queryFundsTestcases.length > 0) {
        const testcase = queryFundsTestcases.shift();
        it(testcase.name, async function () {
            const re = await request.queryFundsForProposalByFunder(testcase.input, testcase.inputEnv).catch(rej => {
                console.log("REJ", rej);
                expect(rej.error.code).to.equals(testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log("re", re);
                expect(re).to.exist
            }
        });
    }
});

const queryCustomTestcases = [
    {
        name: "test1",
        inputMethod: "",
        inputParams: {},
        inputEnv: {url: env.url},
        expect: -14012
    },
    {
        name: "test2",
        inputMethod: "query.Balance",
        inputParams: {},
        inputEnv: {url: env.url},
        expect: -100101
    },
    {
        name: "test3",
        inputMethod: "abc",
        inputParams: {},
        inputEnv: {url: env.url},
        expect: -14012
    },
    {
        name: "test4",
        inputMethod: "",
        inputParams: {},
        inputEnv: {url: "123"},
        expect: -12005
    }
];

describe("customized query test", function () {
    while (queryCustomTestcases.length > 0) {
        const testcase = queryCustomTestcases.shift();
        it(testcase.name, async function () {
            const re = await request.queryCustom(testcase.inputMethod, testcase.inputParams, testcase.inputEnv).catch(rej => {
                console.log("REJ", rej);
                expect(rej.error.code).to.equals(testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log("re", re);
                expect(re.response).to.exist
            }
        });
    }
});
