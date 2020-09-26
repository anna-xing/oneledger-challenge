const request = require("../main");
const expect = require("chai").expect;

const env = {
    url: "http://127.0.0.1:8080"
};

const queryBlockTestCase = [
    {
        name: "test1, no block height input which will get the latest 20 blocks",
        input_blockHeight: undefined,
        input_chainID: undefined,
        input_env: env,
        expect: ""
    },
    {
        name: "test2, set block height as 1",
        input_blockHeight: 1,
        input_env: env,
        expect: ""
    },
    {
        name: "test3, set block height as 0 which will get the latest block",
        input_blockHeight: 0,
        input_env: env,
        expect: ""
    },
    {
        name: "test4, set block height as 10000",
        input_blockHeight: 10000,
        input_env: env,
        expect: -20000
    },
    {
        name: "test5, set block height as 111.1",
        input_blockHeight: 111.1,
        input_env: env,
        expect: -10009
    },
    {
        name: "test6, set block height as 1 and invalid env, will use default env",
        input_blockHeight: 1,
        input_env: {a: 1, b: 2},
        expect: -10009
    },
    {
        name: "test7, set block height as 1 and invalid env url",
        input_blockHeight: 1,
        input_env: {a: 1, b: 2, url: 123},
        expect: -12005
    },
    {
        name: "test8, set block height as 1 and invalid env url",
        input_blockHeight: 1,
        input_env: {a: 1, b: 2, url: undefined},
        expect: -12005
    },
    {
        name: "test9, set block height as 1 and valid env with chainID",
        input_blockHeight: 10,
        input_chainID: "OneLedger-7592",
        input_env: env,
        expect: -12005
    },
    {
        name: "test10, set block height as 1 and valid env with chainID already in url",
        input_blockHeight: 10,
        input_chainID: "OneLedger-7592",
        input_env:  {
            url: "http://127.0.0.1:8080/?chainID=what"
        },
        expect: -20000
    }
];

describe("test query blocks", function () {
    queryBlockTestCase.forEach(function (testcase) {
        it(testcase.name, async function () {
            const data = {
                blockHeight: testcase.input_blockHeight,
                chainID: testcase.input_chainID
            };
            const re = await request.block.queryBlocks(data, testcase.input_env).catch(err => {
                console.log("err", err);
                expect(err.error.code).to.equals(testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log("re", re.response);
                expect(re.response).to.exist
            }
        })
    })
});


const queryBlockWithBeforeHeightTestCase = [
    {
        name: "test1, valid before blockheight and limit number",
        input: {
            beforeHeight: 2,
            limit: 2
        },
        expect: true
    },
    {
        name: "test2, blockheight and limit number are both 0",
        input: {
            beforeHeight: 0,
            limit: 0
        },
        expect: -10011
    },
    {
        name: "test3, blockheight is 0, limit is 2",
        input: {
            beforeHeight: 747500,
            limit: 10
        },
        expect: true
    },
    {
        name: "test4, blockheight is 2, limit is 0",
        input: {
            beforeHeight: 2,
            limit: 0
        },
        expect: -10011
    },
    {
        name: "test5, blockheight is 2, no limit",
        input: {
            beforeHeight: 2,
            limit: undefined
        },
        expect: true
    },
    {
        name: "test7, no blockheight, limit is 2",
        input: {
            beforeHeight: undefined,
            limit: 2
        },
        expect: true
    },
    {
        name: "test8, no blockheight, no limit",
        input: {
            beforeHeight: undefined,
            limit: undefined
        },
        expect: -10010
    },
    {
        name: "test9, invalid blockheight, no limit",
        input: {
            beforeHeight: 1.1,
            limit: undefined
        },
        expect: -10009
    },
    {
        name: "test10, valid blockheight, no limit, invalid env",
        input: {
            beforeHeight: 1,
            limit: undefined,
            env: {a: 1, b: 2, url: ""},
        },
        expect: -12005
    },
    {
        name: "test11, valid blockheight, no limit, invalid env",
        input: {
            beforeHeight: 1,
            limit: undefined,
            env: {a: 1, b: 2, url: "127.0.0.1:8080"},
        },
        expect: -12005
    },
    {
        name: "test12, valid blockheight, no limit, valid env",
        input: {
            beforeHeight: 1,
            limit: undefined,
            env: {a: 1, b: 2, url: "http://127.0.0.1:8080"},
        },
        expect: -20005
    },
    {
        name: "test13, valid blockheight, no limit, valid env with chainID",
        input: {
            beforeHeight: 10,
            limit: undefined,
            chainID: "OneLedger-7592",
            env: {a: 1, b: 2, url: "http://127.0.0.1:8080"},
        },
        expect: true
    },
    {
        name: "test14, valid blockheight, no limit, valid env with chainID already in url",
        input: {
            beforeHeight: 10,
            limit: undefined,
            chainID: "OneLedger-7592",
            env: {a: 1, b: 2, url: "http://127.0.0.1:8080/?chainID=what"},
        },
        expect: -20000
    }
];

describe("test query blocks with before block height and limit", function () {
    queryBlockWithBeforeHeightTestCase.forEach(function (testcase) {
        it(testcase.name, async function () {
            const data = {
                beforeHeight: testcase.input.beforeHeight,
                limit: testcase.input.limit,
                chainID: testcase.input.chainID
            };
            const re = await request.block.queryBlocksBeforeHeight(data, testcase.input.env).catch(err => {
                console.log("err", err);
                expect(err.error.code).to.equals(testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log("re", re.response);
                expect(re.response).to.exist
            }
        })
    })
});
