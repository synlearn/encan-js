import Logger from "./logger";
import UUID from "./uuid";
import CONSTANTS from "./constants";

let flatten = require('flat');

let isNestedObject = (x) => (typeof x === 'object' || Array.isArray(x) && x !== null);

const DataStore = {
    delimiter: '__',
    getUserDeviceInfo() {
        let _navigator = {};
        let _document = {};
        let copyKeyNavigator = ["vendorSub", "productSub", "vendor", "doNotTrack",
            "cookieEnabled", "appCodeName", "appName", "appVersion", "platform",
            "product", "userAgent", "deviceMemory", "userAgentData", "mobile"];
        let copyKeyDocument = ['location', 'title', 'URL']; //'activeElement',

        for (let i in window.navigator) {
            if (copyKeyNavigator.indexOf(i) !== -1 && navigator[i]) {
                _navigator[i] = navigator[i];

                if (isNestedObject(navigator[i])) {
                    _navigator[i] = {};
                    for (let j in navigator[i]) {
                        if (!isNestedObject(_navigator[i][j]))
                            _navigator[i][j] = navigator[i][j];
                    }
                }
            }

        }
        if (navigator["connection"]) {
            _navigator["connection"] = {
                downlink: navigator["connection"]["downlink"],
                effectiveType: navigator["connection"]["effectiveType"],
            }
        }


        for (let i in window.document) {
            if (copyKeyDocument.indexOf(i) !== -1 && window.document[i]) {
                _document[i] = window.document[i];

                if (isNestedObject(window.document[i])) {
                    {
                        _document[i] = {};
                        for (let j in window.document[i]) {
                            if (!isNestedObject(window.document[i][j]))
                                _document[i][j] = window.document[i][j];
                        }
                    }
                }
            }
        }
        let _register_data = {
            ..._navigator,
            ..._document,
            'type': CONSTANTS.REGISTER_EVENT,
            'm': UUID.getMachineId()
        };
        _register_data = DataStore.flat(_register_data);
        _register_data = JSON.parse(JSON.stringify(_register_data));
        __LOCAL__ && Logger.log("_register_data", _register_data);
        return _register_data;
    }, flat: function (xdata) {
        let data = flatten(xdata, {
            delimiter: DataStore.delimiter,
            transformKey: function (key) {
                return ("" + key).toLowerCase();
            }
        });
        return JSON.parse(JSON.stringify(data));
    }
};
export default DataStore