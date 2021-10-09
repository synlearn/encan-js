import Logger from "./logger";
import UUID from "./uuid";
import CONSTANTS from "./constants";

let flatten = require('flat');

let isNestedObject = (x) => (typeof x === 'object' || Array.isArray(x) && x !== null);

const DataStore = {
    delimiter: '__',
    getPageViewInfo() {
        return {
            ...this.getDocumentInfo(),
            'type': CONSTANTS.PAGE_VIEW_EVENT,
            'm': UUID.getMachineId(),
            'v': UUID.getVisitorId(),
            't': new Date().getTime(),
            'e':'view'

        };
    },
    getDocumentInfo: function () {
        let copyKeyDocument = ['location', 'title', 'URL']; //'activeElement',
        let _document = {};
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
        return _document;
    }, getUserDeviceInfo() {
        let _navigator = {};
        let copyKeyNavigator = ["vendorSub", "productSub", "vendor", "doNotTrack",
            "cookieEnabled", "appCodeName", "appName", "appVersion", "platform",
            "product", "userAgent", "deviceMemory", "userAgentData", "mobile"];

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
        let _document = this.getDocumentInfo();
        let _register_data = {
            ..._navigator,
            ..._document,
            'type': CONSTANTS.REGISTER_EVENT,
            'm': UUID.getMachineId(),
            't': new Date().getTime(),
            'e':'first_view'
        };
        //_register_data = DataStore.flat(_register_data);
        // _register_data = JSON.parse(JSON.stringify(_register_data));
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