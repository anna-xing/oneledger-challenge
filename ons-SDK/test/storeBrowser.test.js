const should = require("should");
const storeBrowser = require("../store/storeBrowser");
const {updateSDKConfig} = require("../requestGenerator");
const testUtil = require("./testUtil");
const requestConfig = require("../requestConfig");

const mockDefaultData = {
    "testkey1": "mockdata1"
};

const wlStoreCreationTestcases = [
    {
        name: "test 1, create a new window.localStorage, should be no error",
        input_storeDefaultData: {
            storeName: "config.json",
            storeLocation: "/services",
            defaultData: mockDefaultData
        },
        expect: mockDefaultData
    },
    {
        name: "test 2, load an existing window.localStorage, should be no error",
        input_storeDefaultData: {
            storeName: "config.json",
            storeLocation: "/services",
            defaultData: mockDefaultData
        },
        expect: mockDefaultData
    },
    {
        name: "test 3, create window.localStorage with empty init data, should be error",
        input_storeDefaultData: undefined,
        expect: false
    },
    {
        name: "test 4, create another new window.localStorage, should be no error",
        input_storeDefaultData: {
            storeName: "new_config.json",
            storeLocation: "/services",
            defaultData: {a: "1"}
        },
        expect: {a: "1"}
    },
    {
        name: "test 5, load the new window.localStorage created in test 4, should be no error",
        input_storeDefaultData: {
            storeName: "new_config.json",
            storeLocation: "/services",
            defaultData: mockDefaultData
        },
        expect: {a: "1"}
    }
];

describe("window.localStorage store creation test", () => {
    wlStoreCreationTestcases.forEach(testcase => {
        it(testcase.name, function () {
            let wlStore;
            try {
                wlStore = new storeBrowser(testcase.input_storeDefaultData)
            } catch (err) {
                console.log(err);
                if (!testcase.expect) return;
                should.fail(err, undefined, "should be no error : ", err)
            }
            console.log("created store: ", wlStore);
            should.deepEqual(wlStore.data, testcase.expect, "wlStore data should be the same as default data")
        });
    });
    after(()=> {
       window.localStorage.clear()
    })
});

const wlStoreGetTestcases = [
    {
        name: "test1, get from a existing key",
        input_key: "testkey1",
        expect: mockDefaultData.testkey1
    },
    {
        name: "test2, get from a non-existing key",
        input_key: "abcde",
        expect: undefined
    },
    {
        name: "test3, key is empty",
        input_key: undefined,
        expect: undefined
    }
];

describe("window.localStorage store get test", ()=> {
    let wlStore;
    before(() => {
        const storeInitOpt = {
            storeName: "config.json",
            defaultData: mockDefaultData
        };
        try {
            wlStore = new storeBrowser(storeInitOpt)
        } catch (err) {
            should.fail(err, undefined, "should be no error : ", err)
        }
        console.log("init window.localStore :", wlStore)
    });
    wlStoreGetTestcases.forEach(testcase => {
        it(testcase.name, function () {
            let fetchedValue;
            try {
                fetchedValue = wlStore.get(testcase.input_key)
            } catch (err) {
                console.log(err);
                should.fail(err, undefined, "should be no error : ", err)
            }
            console.log("fetched value :", fetchedValue);
            should.equal(fetchedValue, testcase.expect, "wlStore data value should be the same as default data value")
        });
    });
    after(()=> {
       window.localStorage.clear()
    })
});

const wlStoreSetTestcases = [
    {
        name: "test1, set a non-existing valid k-v",
        input_key: "testkey2",
        input_value: "mockdata2",
        expect: "mockdata2"
    },
    {
        name: "test2, replace an existing k-v",
        input_key: "testkey1",
        input_value: "new_mockdata1",
        expect: "new_mockdata1"
    },
    {
        // since empty value check is moved to endpoint to avoid circular require
        name: "test3, key is empty",
        input_key: undefined,
        input_value: "mockdata3",
        expect: "mockdata3"
    },
    {
        // since empty value check is moved to endpoint to avoid circular require
        name: "test4, value is empty",
        input_key: "testkey4",
        input_value: "",
        expect: ""
    }
];

describe("window.localStorage store set test", ()=> {
    let wlStore;
    before(() => {
        const storeInitOpt = {
            storeName: "config.json",
            defaultData: mockDefaultData
        };
        try {
            wlStore = new storeBrowser(storeInitOpt)
        } catch (err) {
            should.fail(err, undefined, "should be no error : ", err)
        }
        console.log("init window.localStore :", wlStore)
    });
    wlStoreSetTestcases.forEach(testcase => {
        it(testcase.name, function () {
            try {
                wlStore.set(testcase.input_key, testcase.input_value)
            } catch (err) {
                console.log(err);
                should.equal(err.message, testcase.expect, "catching expected error");
                return
            }
            console.log("store data after set :", wlStore.data);
            // since empty value check is moved to endpoint to avoid circular require
            // let exist = false;
            // Object.keys(wlStore.data).find(key => {
            //     if (key === testcase.input_key) {
            //         exist = true;
            //         should.deepEqual(wlStore.data[key], testcase.expect)
            //     }
            // });
            // if (!exist) should.fail(undefined,undefined, "set data not working, data not exist")
        });
    });
    after(()=> {
        window.localStorage.clear()
    })
});

const wlStoreUpdateSDKConfigTestcases = [
    {
        name: "test1, add new config",
        defaultData: undefined,
        expect: testUtil.updateSDKConfigExpect
    },
    {
        name: "test2, replace an existing outdated config",
        defaultData: {"txTypes":[{"TxTypeNum":1,"TxTypeString":"SEND"}]},
        expect: testUtil.updateSDKConfigExpect
    }
];

describe("window.localStorage store update SDK config test", ()=> {
    let wlStore;
    let storeInitOpt;
    wlStoreUpdateSDKConfigTestcases.forEach(testcase => {
        it(testcase.name, async function () {
            //setup config file with defaultData per case
            storeInitOpt = {
                storeName: requestConfig.sdkConfigFileName,
                defaultData: testcase.defaultData
            };
            try {
                wlStore = new storeBrowser(storeInitOpt)
            } catch (err) {
                should.fail(err, undefined, "should be no error : ", err)
            }
            console.log("init window.localStore :", wlStore);
            try {
                await updateSDKConfig(testUtil.browserEnv);
            } catch (err) {
                console.log("err: ", err);
                should.equal(err.message, testcase.expect, "catching expected error");
                return
            }
            // check the content of wlStore
            // here reuse wlStore = new storeBrowser(storeInitOpt) because updateSDKConfig does not directly use store.set method, it has nothing to do with olStore object,
            // the olStore won't be updated unless we do so.

            try {
                wlStore = new storeBrowser(storeInitOpt)
            } catch (err) {
                should.fail(err, undefined, "should be no error : ", err)
            }

            console.log("store data after set :", wlStore);
            should.deepEqual(wlStore.data.txTypes, testcase.expect, "these two should equal");
        });
    });
    afterEach(()=> {
        window.localStorage.clear();
        console.log("clear!")
    })
});


