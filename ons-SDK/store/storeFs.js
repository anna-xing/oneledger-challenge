const path = require('path');
const fs = require('fs');

/*************** This is the store implementation for local file system storage ****************/

class Store {
    /**
     * @param storeInitOpt
     * @param storeInitOpt.storeName {string} store name
     * @param storeInitOpt.storeLocation {string} store path
     * @param storeInitOpt.defaultData {Object} any init data in JSON format
     */
    constructor(storeInitOpt) {
        const {storeLocation = './', storeName, defaultData = {}} = storeInitOpt || {};
        try {
            this.path = path.join(storeLocation, storeName)
        } catch (err) {
            throw Error("Unable to verify store path: " + `${storeLocation}${storeName}` + ". please provide valid storeLocation with storeName")
        }
        this.storeName = storeName;
        let isFileExist;
        try {
            isFileExist = fs.existsSync(this.path)
        } catch (err) {
            throw Error("Unable to check if local file system store already exists")
        }
        if (isFileExist) {
            let dataJson;
            try {
                dataJson = JSON.parse(fs.readFileSync(this.path, 'utf8'))
            } catch (err) {
                throw Error("File exists, but unable to load the store data from local file system : " + err)
            }
            this.data = dataJson
        } else {
            try {
                fs.writeFileSync(this.path, JSON.stringify(defaultData, null, 2))
            } catch (err) {
                throw Error("Unable to create local file system store under " + this.path)
            }
            this.data = defaultData
        }
    }

    set(key, value) {
        // use updateStore in util to access this function, since empty value check is moved to there to avoid circular require
        const jsonData = {[key]: value};
        const newData = {...this.data, ...jsonData};
        fs.writeFileSync(this.path, JSON.stringify(newData, null, 2), function (err) {
            if (err) throw Error("Unable to write to local file system when set data to store: " + err)
        });
        this.data = newData
    }

    get(key) {
        return this.data[key]
    }
}

module.exports = Store;
