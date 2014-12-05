/**
 * Created by tscheinecker on 05.12.2014.
 */

'use strict';


(function () {

    // test model class

    window.cat = window.cat || {};
    window.cat.util = window.cat.util || {};
    window.cat.util.test = window.cat.util.test || {};

    function Test(data) {
        this.isTestObject = true;
        this.id = 'converted_' + data.id;
        this.name = 'converted_' + data.name;
    }

    Test.prototype.equals = function (data) {
        return data.id === this.id && data.name === this.name;
    };

    window.cat.util.test.Model = Test;

    function _expectToEqualConverted(data, converted) {
        if (_.isArray(data)) {
            expect(_.isArray(converted)).toBe(true);
            expect(data.length).toBe(converted.length);
            _.forEach(data, function(_data, idx) {
                _expectToEqualConverted(_data, converted[idx]);
            });
        } else {
            var expected = (converted.isTestObject === true ? converted : new Test(converted));
            expect(data).toEqual(expected);
        }
    }

    window.cat.util.test.expectToEqualConverted = _expectToEqualConverted;

})();
