const add_olt = require('../requestOLTcmd');
const expect = require('chai').expect;

describe('request OLT test for cmd', function () {
    it('should return false with empty argvs', function () {
        // setup process.argv
        while (process.argv.length !== 2) {
            process.argv.pop()
        }
        const result = add_olt.requestOLT();
        expect(result).equals(false)
    });
    it('should return false with less than 4 argvs', function () {
        // setup process.argv
        while (process.argv.length >= 3) {
            process.argv.pop()
        }
        process.argv[2] = "0lt1234567890123456789012345678901234567890";
        const result = add_olt.requestOLT();
        expect(result).equals(false)
    });
    it('should return false with more than 5 argvs', function () {
        // setup process.argv
        while (process.argv.length >= 3) {
            process.argv.pop()
        }
        process.argv[2] = "0lt1234567890123456789012345678901234567890";
        process.argv[3] = "1000";
        process.argv[4] = "123.456.789.123:8080";
        process.argv[5] = "fifth_args";
        const result = add_olt.requestOLT();
        expect(result).equals(false)
    });
    it('should return no error with 4 argvs', function () {
        // setup process.argv
        while (process.argv.length >= 3) {
            process.argv.pop()
        }
        process.argv[2] = "0lt1234567890123456789012345678901234567890";
        process.argv[3] = "1000";
        const result = add_olt.requestOLT();
        expect(result).to.be.an('undefined');
    });
    it('should return error with 5 argvs using given non sense as url', function () {
        // setup process.argv
        while (process.argv.length >= 3) {
            process.argv.pop()
        }
        process.argv[2] = "0lt1234567890123456789012345678901234567890";
        process.argv[3] = "1000";
        process.argv[4] = "1231232131,123,5,1230";
        const result = add_olt.requestOLT();
        expect(result).equals(false);
    });
    it('should return no error with 5 argvs using given valid pattern but invalid url', function () {
        // setup process.argv
        while (process.argv.length >= 3) {
            process.argv.pop()
        }
        process.argv[2] = "0lt1234567890123456789012345678901234567890";
        process.argv[3] = "1000";
        process.argv[4] = "127.0.0.1:8080";
        const result = add_olt.requestOLT();
        expect(result).to.not.be.ok
    });
    it('should return false with 4 argvs with invalid address (short length)', function () {
        // setup process.argv
        while (process.argv.length >= 3) {
            process.argv.pop()
        }
        process.argv[2] = "0lt123456789012345678901234567890123456789";
        process.argv[3] = "1000";
        const result = add_olt.requestOLT();
        expect(result).equals(false)
    });
    it('should return false with 4 argvs with invalid address (not start with 0lt)', function () {
        // setup process.argv
        while (process.argv.length >= 3) {
            process.argv.pop()
        }
        process.argv[2] = "1234567890123456789012345678901234567890";
        process.argv[3] = "1000";
        const result = add_olt.requestOLT();
        expect(result).equals(false)
    });
    it('should return false with 4 argvs with invalid amount', function () {
        // setup process.argv
        while (process.argv.length >= 3) {
            process.argv.pop()
        }
        process.argv[2] = "0lt1234567890123456789012345678901234567890";
        process.argv[3] = "1000000";
        const result = add_olt.requestOLT();
        expect(result).equals(false);
    });
    it('should return false with invalid amount input(non number)', function () {
        // setup process.argv
        while (process.argv.length >= 3) {
            process.argv.pop()
        }
        process.argv[2] = "0lt1234567890123456789012345678901234567890";
        process.argv[3] = "abcde123";
        const result = add_olt.requestOLT();
        expect(result).equals(false)
    });
    it('should return false with invalid amount(non number) with valid pattern url', function () {
        // setup process.argv
        while (process.argv.length >= 3) {
            process.argv.pop()
        }
        process.argv[2] = "0lt1234567890123456789012345678901234567890";
        process.argv[3] = "123a";
        process.argv[4] = "127.0.0.1:8080";
        const result = add_olt.requestOLT();
        expect(result).equals(false)
    });
});
