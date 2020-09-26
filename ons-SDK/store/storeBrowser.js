const path = require('path');

/*************** This is the store implementation for browser storage ****************/

class Store {
    /**
     * @param storeInitOpt
     * @param storeInitOpt.storeName {string} store name
     * @param storeInitOpt.storeLocation {string} store path
     * @param storeInitOpt.defaultData {Object} any init data in JSON format
     */
    constructor(storeInitOpt) {
        const {storeLocation = __dirname, storeName, defaultData = {}} = storeInitOpt || {};
        try {
            this.path = path.join(storeLocation, storeName)
        } catch (err) {
            throw Error("Unable to verify store path: " + `${storeLocation}${storeName}` + ". please provide valid storeLocation with storeName")
        }
        this.storeName = storeName;
        try {
            if (window.localStorage.getItem(this.path) !== null) {
                this.data = JSON.parse(window.localStorage.getItem(this.path))
            } else {
                window.localStorage.setItem(this.path, JSON.stringify(defaultData));
                this.data = defaultData
            }
        } catch (err) {
            throw Error("Unable to init window.localStorage: " + err)
        }
    }

    set(key, value) {
        const jsonData = {[key]: value};
        const newData = {...this.data, ...jsonData};
        try {
            window.localStorage.setItem(this.path, JSON.stringify(newData));
            this.data = newData
        } catch (err) {
            throw Error("Unable to set data to window.localStorage: " + err)
        }
    }

    get(key) {
        return this.data[key]
    }
}

module.exports = Store;
