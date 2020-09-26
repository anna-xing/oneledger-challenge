const storeFs = require("../store/storeFs");
const should = require("should");
const {removeCreatedTestFiles} = require("./testUtil");

const mockDefaultData = {
    "testkey1": "mockdata1"
};

const fsStoreCreationTestcases = [
    {
        name: "test1, create a new fs store, should be no err",
        input_storeDefaultData: {
            storeName: "config.json",
            storeLocation: "./",
            defaultData: mockDefaultData
        },
        expect: true
    },
    {
        name: "test2, load a fs store, should be no error but will overwrite the whole file",
        input_storeDefaultData: {
            storeName: "config.json",
            storeLocation: "./",
            defaultData: mockDefaultData
        },
        expect: true
    },
    {
        name: "test3, create a fs store, should be error since file path is not exists",
        input_storeDefaultData: {
            storeName: "config.json",
            storeLocation: "abcdefg",
            defaultData: mockDefaultData
        },
        expect: false
    },
    {
        name: "test4, create another fs store, should be no error",
        input_storeDefaultData: {
            storeName: "configSystem.json",
            storeLocation: "./",
            defaultData: mockDefaultData
        },
        expect: true
    },
    {
        name: "test5, create fs store with empty init data, should be error",
        input_storeDefaultData: undefined,
        expect: false
    },
    {
        name: "test6, create fs store with nonsense init data, should be error",
        input_storeDefaultData: {a:1, b:"2"},
        expect: false
    }
];

describe("file system store creation test", () => {
    fsStoreCreationTestcases.forEach(testcase => {
        it(testcase.name, function () {
            let fsStore;
            try {
                fsStore = new storeFs(testcase.input_storeDefaultData)
            } catch (err) {
                console.log(err);
                should.equal(false, testcase.expect, err)
            }
            if (typeof fsStore !== "undefined") {
                console.log("store data ", fsStore.data);
                should.equal(true, testcase.expect)
            }
        })
    });
    after(() => {
        try {
            const fileList = ["./config.json", "./configSystem.json"];
            removeCreatedTestFiles(fileList)
        } catch (err) {
            should.fail(err, undefined, err)
        }
    })
});

const fsStoreGetTestcases = [
    {
        name: "test1, get data by key in fs store, should be no error",
        input_getDataByKey: "testkey1",
        expect: mockDefaultData.testkey1
    },
    {
        name: "test2, get data by key in fs store, should be no error and returns undefined",
        input_getDataByKey: "abcdefg",
        expect: undefined
    },
    {
        name: "test3, get data by key in fs store, should be no error and returns undefined",
        input_getDataByKey: undefined,
        expect: undefined
    }
];

describe("file system store get test", () => {
    let fsStore;
    before(() => {
        const storeInitOpt = {
            storeName: "config.json",
            storeLocation: "./",
            defaultData: mockDefaultData
        };
        try {
            fsStore = new storeFs(storeInitOpt)
        } catch (err) {
            should.fail(err, undefined, "create a store first, should be no error")
        }
    });
    fsStoreGetTestcases.forEach(testcase => {
        it(testcase.name, () => {
            let data;
            try {
                data = fsStore.get(testcase.input_getDataByKey)
            } catch (err) {
                console.log(err);
                should.fail(err, testcase.expect, "should not be error")
            }
            console.log("store data ", fsStore.data);
            console.log("fetched data ", data);
            should.deepEqual(data, testcase.expect, data)
        });
    });
    after(() => {
        try {
            const fileList = ["./config.json"];
            removeCreatedTestFiles(fileList)
        } catch (err) {
            should.fail(err, undefined, err)
        }
    })
});

const fsStoreSetTestcases = [
    {
        name: "test1, new valid k-v data, should be no error",
        input_key: "key1",
        input_value: "value1",
        expect: "value1"
    },
    {
        name: "test2, replace existing k-v data, should be no error",
        input_key: "DomainSuffix",
        input_value: ["ol", "ab", "cd"],
        expect: ["ol", "ab", "cd"]
    },
    {
        name: "test3, valid k-v data, should be no error",
        input_key: "key2",
        input_value: {"subKey1": {"subKey2": [1, 2, 3]}},
        expect: {"subKey1": {"subKey2": [1, 2, 3]}}
    },
    {
        //since empty value check is moved to endpoint to avoid circular require
        name: "test4, empty k-v data, should be no error",
        input_key: "",
        input_value: "stringdata",
        expect: "stringdata"
    },
    {
        //since empty value check is moved to endpoint to avoid circular require
        name: "test5, empty k-v data, should be no error",
        input_key: "123",
        input_value: undefined,
        expect: undefined
    }
];

describe("file system store set test", () => {
    let fsStore;
    before(() => {
        const storeInitOpt = {
            storeName: "config.json",
            storeLocation: "./",
            defaultData: mockDefaultData
        };
        try {
            fsStore = new storeFs(storeInitOpt)
        } catch (err) {
            should.fail(err, undefined, "create a store first, should be no error")
        }
        console.log("store data init :", fsStore.data);
    });
    fsStoreSetTestcases.forEach(testcase => {
        it(testcase.name, () => {
            try {
                fsStore.set(testcase.input_key, testcase.input_value)
            } catch (err) {
                console.log(err);
                should.equal(err.message, testcase.expect, "catching expected error");
                return
            }
            console.log("store data after set :", fsStore.data);
            let exist = false;
            Object.keys(fsStore.data).find(key => {
                if (key === testcase.input_key) {
                    exist = true;
                    should.deepEqual(fsStore.data[key], testcase.expect)
                }
            });
            if (!exist) should.fail(undefined,undefined, "set data not working, data not exist")
        });
    });
    after(async () => {
        try {
            const fileList = ["./config.json"];
            await removeCreatedTestFiles(fileList)
        } catch (err) {
            should.fail(err, undefined, err)
        }
    })
});




