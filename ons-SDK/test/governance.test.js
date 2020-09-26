const should = require('should');
const {env} = require("./testUtil");
const {governance} = require('../internal');
const expect = require('chai').expect;

const validAddress = "0lt1234567890123456789012345678901234567890"
const validAddress2 = "0lt1010101010101010101010101010101010101010"

const proposalCreateTxTestcases = [
    {
        name: "test 1, valid create proposal tx",
        inputCreateProposal: {
            proposalType: 32,
            description: "create proposal tx offline",
            headline: "headline",
            proposer: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            initialFunding: {
                currency: "OLT",
                value: "10000"
            }
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test 2, invalid create proposal tx, invalid proposalID",
        inputCreateProposal: {
            proposalType: 32,
            description: "create proposal tx offline",
            headline: "headline",
            proposer: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            initialFunding: {
                currency: "OLT",
                value: "10000"
            }
        },
        inputEnv: env,
        expect: -14001
    },
    {
        name: "test 3, invalid create proposal tx, invalid Proposal Description",
        inputCreateProposal: {
            proposalType: 32,
            description: "",
            headline: "headline",
            proposer: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            initialFunding: {
                currency: "OLT",
                value: "10000"
            }
        },
        inputEnv: env,
        expect: -14002
    },
    {
        name: "test 4, invalid create proposal tx, invalid Proposer",
        inputCreateProposal: {
            proposalType: 32,
            description: "create proposal tx offline",
            headline: "headline",
            proposer: "0x35Aca16AC2a47d682B954242225Ceed3211D5c80",
            initialFunding: {
                currency: "OLT",
                value: "10000"
            }
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test 5, invalid create proposal tx, invalid Proposer type",
        inputCreateProposal: {
            proposalType: 1000,
            description: "create proposal tx offline",
            headline: "headline",
            proposer: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            initialFunding: {
                currency: "OLT",
                value: "10000"
            }
        },
        inputEnv: env,
        expect: -14003
    },
    {
        name: "test 6, invalid create proposal tx, invalid initialFunding",
        inputCreateProposal: {
            proposalType: 33,
            description: "create proposal tx offline",
            headline: "headline",
            proposer: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            initialFunding: {
                currency: "ETH",
                value: "10000"
            }
        },
        inputEnv: env,
        expect: -14005
    },
    {
        name: "test 7, valid create proposal tx, valid gasAdjustment is provided",
        inputCreateProposal: {
            proposalType: 32,
            description: "create proposal tx offline",
            headline: "headline",
            proposer: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            initialFunding: {
                currency: "OLT",
                value: "10000"
            },
            gasAdjustment: 100000
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test 8, invalid create proposal tx, invalid gasAdjustment is provided",
        inputCreateProposal: {
            proposalType: 32,
            description: "create proposal tx offline",
            headline: "headline",
            proposer: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            initialFunding: {
                currency: "OLT",
                value: "10000"
            },
            gasAdjustment: "100000"
        },
        inputEnv: env,
        expect: -12028
    },
    {
        name: "test 9, invalid create proposal tx, invalid headline",
        inputCreateProposal: {
            proposalType: 32,
            description: "create proposal tx offline",
            headline: "",
            proposer: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            initialFunding: {
                currency: "OLT",
                value: "10000"
            },
            gasAdjustment: "100000"
        },
        inputEnv: env,
        expect: -14009
    }
];

describe("create proposal offline test", async () => {
    proposalCreateTxTestcases.forEach(testcase => {
        it(testcase.name, async () => {
            const re = await governance.proposalCreateTxOffline(testcase.inputCreateProposal, testcase.inputEnv).catch(err => {
                console.error(err)
                if (testcase.expect !== true) should.equal(err.error.code, testcase.expect, "error code should be equal as expect")
            });
            if (typeof re !== "undefined") {
                console.log(re);
                should.exist(re.response, "rawTx should exists")
            }
        });
    })
});

const proposalCancelTxTestcases = [
    {
        name: "test 1, valid cancel proposal tx",
        inputCancelProposal: {
            proposalID: "id1",
            proposer: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            reason: "reason"
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test 1, invalid cancel proposal tx, invalid proposalID",
        inputCancelProposal: {
            proposalID: "",
            proposer: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            reason: "reason"
        },
        inputEnv: env,
        expect: -14001
    },
    {
        name: "test 2, invalid cancel proposal tx, invalid proposer",
        inputCancelProposal: {
            proposalID: "id2",
            proposer: "0x35Aca16AC2a47d682B954242225Ceed3211D5c80",
            reason: "reason"
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test 3, invalid cancel proposal tx, invalid reason",
        inputCancelProposal: {
            proposalID: "id2",
            proposer: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            reason: ""
        },
        inputEnv: env,
        expect: -14006
    },
    {
        name: "test 4, valid cancel proposal tx, valid gasAdjustment is provided",
        inputCancelProposal: {
            proposalID: "id1",
            proposer: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            reason: "reason",
            gasAdjustment: 100000
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test 5, invalid cancel proposal tx, invalid gasAdjustment is provided",
        inputCancelProposal: {
            proposalID: "id1",
            proposer: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            reason: "reason",
            gasAdjustment: "100000"
        },
        inputEnv: env,
        expect: -12028
    }
];

describe("cancel proposal offline test", async () => {
    proposalCancelTxTestcases.forEach(testcase => {
        it(testcase.name, async () => {
            const re = await governance.proposalCancelTxOffline(testcase.inputCancelProposal, testcase.inputEnv).catch(err => {
                console.error(err)
                if (testcase.expect !== true) should.equal(err.error.code, testcase.expect, "error code should be equal as expect")
            });
            if (typeof re !== "undefined") {
                console.log(re);
                should.exist(re.response, "rawTx should exists")
            }
        });
    })
});

const proposalFundTxTestcases = [
    {
        name: "test 1, valid fund proposal tx",
        inputFundProposal: {
            proposalID: "id1",
            funderAddress: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            fundValue: {
                currency: "OLT",
                value: "10000"
            }
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test 2, invalid fund proposal tx, invalid proposalID",
        inputFundProposal: {
            proposalID: "",
            funderAddress: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            fundValue: {
                currency: "OLT",
                value: "10000"
            }
        },
        inputEnv: env,
        expect: -14001
    },
    {
        name: "test 3, invalid fund proposal tx, invalid funderAddress",
        inputFundProposal: {
            proposalID: "id3",
            funderAddress: "0x35Aca16AC2a47d682B954242225Ceed3211D5c80",
            fundValue: {
                currency: "OLT",
                value: "10000"
            }
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test 4, valid fund proposal tx, valid gasAdjustment is provided",
        inputFundProposal: {
            proposalID: "id1",
            funderAddress: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            fundValue: {
                currency: "OLT",
                value: "10000"
            },
            gasAdjustment: 100000
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test 5, invalid fund proposal tx, invalid gasAdjustment is provided",
        inputFundProposal: {
            proposalID: "id1",
            funderAddress: "0lt35Aca16AC2a47d682B954242225Ceed3211D5c80",
            fundValue: {
                currency: "OLT",
                value: "10000"
            },
            gasAdjustment: "100000"
        },
        inputEnv: env,
        expect: -12028
    }
];

describe("fund proposal offline test", async () => {
    proposalFundTxTestcases.forEach(testcase => {
        it(testcase.name, async () => {
            const re = await governance.proposalFundTxOffline(testcase.inputFundProposal, testcase.inputEnv).catch(err => {
                console.error(err)
                if (testcase.expect !== true) should.equal(err.error.code, testcase.expect, "error code should be equal as expect")
            });
            if (typeof re !== "undefined") {
                console.log(re);
                should.exist(re.response, "rawTx should exists")
            }
        });
    })
});

const proposalWithdrawFundTxTestcases = [
    {
        name: "test1, should return rawTx",
        inputWithdrawFunds: {
            proposalID: "123",
            funder: validAddress,
            withdrawalValue: {
                currency: "OLT",
                value: "10000"
            },
            beneficiary: validAddress2
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test2, should return false, empty proposal id",
        inputWithdrawFunds: {
            proposalID: "",
            funder: validAddress,
            withdrawalValue: {
                currency: "OLT",
                value: "10000"
            },
            beneficiary: validAddress2
        },
        inputEnv: env,
        expect: -14001
    },
    {
        name: "test3, should return false, invalid funder address",
        inputWithdrawFunds: {
            proposalID: "123",
            funder: "0x1234567890123456789012345678901234567890",
            withdrawalValue: {
                currency: "OLT",
                value: "10000"
            },
            beneficiary: validAddress2
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test4, should return false, empty funder address",
        inputWithdrawFunds: {
            proposalID: "123",
            funder: "",
            withdrawalValue: {
                currency: "OLT",
                value: "10000"
            },
            beneficiary: validAddress2
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test5, should return false, invalid withdrawValue currency",
        inputWithdrawFunds: {
            proposalID: "123",
            funder: validAddress,
            withdrawalValue: {
                currency: "BTC",
                value: "10000"
            },
            beneficiary: validAddress2
        },
        inputEnv: env,
        expect: -14005
    },
    {
        name: "test6, should return false, empty withdrawValue currency",
        inputWithdrawFunds: {
            proposalID: "123",
            funder: validAddress,
            withdrawalValue: {
                currency: "",
                value: "10000"
            },
            beneficiary: validAddress2
        },
        inputEnv: env,
        expect: -14005
    },
    {
        name: "test7, should return false, invalid withdrawValue value",
        inputWithdrawFunds: {
            proposalID: "123",
            funder: validAddress,
            withdrawalValue: {
                currency: "OLT",
                value: "10000a"
            },
            beneficiary: validAddress2
        },
        inputEnv: env,
        expect: -10002
    },
    {
        name: "test8, should return false, empty withdrawValue value",
        inputWithdrawFunds: {
            proposalID: "123",
            funder: validAddress,
            withdrawalValue: {
                currency: "OLT",
                value: ""
            },
            beneficiary: validAddress2
        },
        inputEnv: env,
        expect: -10002
    },
    {
        name: "test9, should return false, invalid beneficiary",
        inputWithdrawFunds: {
            proposalID: "123",
            funder: validAddress,
            withdrawalValue: {
                currency: "OLT",
                value: "10000"
            },
            beneficiary: "12345"
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test10, should return false, empty beneficiary",
        inputWithdrawFunds: {
            proposalID: "123",
            funder: validAddress,
            withdrawalValue: {
                currency: "OLT",
                value: "10000"
            },
            beneficiary: ""
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test11, should return true, valid gasAdjustment is provided",
        inputWithdrawFunds: {
            proposalID: "123",
            funder: validAddress,
            withdrawalValue: {
                currency: "OLT",
                value: "10000"
            },
            beneficiary: validAddress2,
            gasAdjustment: 100000
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test12, should return false, invalid gasAdjustment is provided",
        inputWithdrawFunds: {
            proposalID: "123",
            funder: validAddress,
            withdrawalValue: {
                currency: "OLT",
                value: "10000"
            },
            beneficiary: validAddress2,
            gasAdjustment: "100000"
        },
        inputEnv: env,
        expect: -12028
    }
];

describe("proposal withdraw fund offline test", async () => {
    proposalWithdrawFundTxTestcases.forEach(testcase => {
        it(testcase.name, async () => {
            const re = await governance.withdrawalFundsTxOffline(testcase.inputWithdrawFunds, testcase.inputEnv).catch(err => {
                console.error(err)
                should.equal(err.error.code, testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log(re);
                should.ok(re.response.rawTx !== "")
            }
        });
    })
});

const voteProposalTxTestcases = [
    {
        name: "test1, should return rawTx",
        inputVoteProposal: {
            proposalID: "createproposala",
            address: "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c1",
            opinion: 0x1
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test2, should return false, empty proposal id",
        inputVoteProposal: {
            proposalID: "",
            address: "0lt90d3cd0a9cf7f767b990159f66b3e071cb3825c1",
            opinion: 0x1
        },
        inputEnv: env,
        expect: -14001
    },
    {
        name: "test3, should return false, invalid address",
        inputVoteProposal: {
            proposalID: "123",
            address: "0x1234567890123456789012345678901234567890",
            opinion: 0x1
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test4, should return false, empty address",
        inputVoteProposal: {
            proposalID: "123",
            address: "",
            opinion: 1
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test5, should return false, invalid vote opinion",
        inputVoteProposal: {
            proposalID: "123",
            address: "0lt1234567890123456789012345678901234567890",
            opinion: 0x6
        },
        inputEnv: env,
        expect: -14007
    },
    {
        name: "test6, should return false, empty vote opinion",
        inputVoteProposal: {
            proposalID: "123",
            address: "0lt1234567890123456789012345678901234567890",
            opinion: ""
        },
        inputEnv: env,
        expect: -14007
    },
    {
        name: "test7, should return true, valid gasAdjustment is provided",
        inputVoteProposal: {
            proposalID: "123",
            address: "0lt1234567890123456789012345678901234567890",
            opinion: 0x1,
            gasAdjustment: 100000
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test8, should return false, invalid gasAdjustment is provided",
        inputVoteProposal: {
            proposalID: "123",
            address: "0lt1234567890123456789012345678901234567890",
            opinion: 0x1,
            gasAdjustment: "100000"
        },
        inputEnv: env,
        expect: -12028
    }
];

describe("vote proposal offline test", async () => {
    voteProposalTxTestcases.forEach(testcase => {
        it(testcase.name, async () => {
            const re = await governance.voteProposalTxOffline(testcase.inputVoteProposal, testcase.inputEnv).catch(err => {
                console.error(err)
                should.equal(err.error.code, testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log(re);
                should.ok(re.response.rawTx !== "")
            }
        });
    })
});

const expireVoteTxTestcases = [
    {
        name: "test1, should return rawTx",
        inputExpireVote: {
            proposalID: "123",
            validatorAddress: validAddress
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test2, should return false, empty proposal id",
        inputExpireVote: {
            proposalID: "",
            validatorAddress: validAddress
        },
        inputEnv: env,
        expect: -14001
    },
    {
        name: "test3, should return false, invalid validator address",
        inputExpireVote: {
            proposalID: "123",
            validatorAddress: "0x1234567890123456789012345678901234567890"
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test4, should return false, empty validator address",
        inputExpireVote: {
            proposalID: "123",
            validatorAddress: ""
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test5, should return true, valid gasAdjustment is provided",
        inputExpireVote: {
            proposalID: "123",
            validatorAddress: validAddress,
            gasAdjustment: 100000
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test6, should return false, invalid gasAdjustment is provided",
        inputExpireVote: {
            proposalID: "123",
            validatorAddress: validAddress,
            gasAdjustment: "100000"
        },
        inputEnv: env,
        expect: -12028
    },
];

describe("expire vote offline test", async () => {
    expireVoteTxTestcases.forEach(testcase => {
        it(testcase.name, async () => {
            const re = await governance.expireVoteTxOffline(testcase.inputExpireVote, testcase.inputEnv).catch(err => {
                console.error(err)
                should.equal(err.error.code, testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log(re);
                should.ok(re.response.rawTx !== "")
            }
        });
    })
});

const finalizeProposalTxTestcases = [
    {
        name: "test1, should return rawTx",
        inputFinalize: {
            proposalID: "123",
            validatorAddress: validAddress
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test2, should return false, empty proposal id",
        inputFinalize: {
            proposalID: "",
            validatorAddress: validAddress
        },
        inputEnv: env,
        expect: -14001
    },
    {
        name: "test3, should return false, invalid validator address",
        inputFinalize: {
            proposalID: "123",
            validatorAddress: "0x1234567890123456789012345678901234567890"
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test4, should return false, empty validator address",
        inputFinalize: {
            proposalID: "123",
            validatorAddress: ""
        },
        inputEnv: env,
        expect: -10000
    },
    {
        name: "test5, should return true, valid gasAdjustment is provided",
        inputFinalize: {
            proposalID: "123",
            validatorAddress: validAddress,
            gasAdjustment: 100000
        },
        inputEnv: env,
        expect: true
    },
    {
        name: "test6, should return false, invalid gasAdjustment is provided",
        inputFinalize: {
            proposalID: "123",
            validatorAddress: validAddress,
            gasAdjustment: "100000"
        },
        inputEnv: env,
        expect: -12028
    },
];

describe("finalize proposal offline test", async () => {
    finalizeProposalTxTestcases.forEach(testcase => {
        it(testcase.name, async () => {
            const re = await governance.finalizeProposalTxOffline(testcase.inputFinalize, testcase.inputEnv).catch(err => {
                console.error(err)
                should.equal(err.error.code, testcase.expect)
            });
            if (typeof re !== "undefined") {
                console.log(re);
                should.ok(re.response.rawTx !== "")
            }
        });
    })
});
