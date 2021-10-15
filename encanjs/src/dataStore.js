import Logger from "./logger";
import UUID from "./uuid";
import CONSTANTS from "./constants";

let flatten = require('flat');

let isNestedObject = (x) => (typeof x === 'object' || Array.isArray(x) && x !== null);

const DataStore = {
    keyMap:   new Object({'brands':'ba','location':'lc','document':'wv','useragentdata':'uax','useragent':'ua'}),
    delimiter: '__',
    getTripInfo() {
        return {
            'type': CONSTANTS.TRIP_EVENT,
            'm': UUID.getMachineId(),
            'v': UUID.getVisitorId(),
            't': new Date().getTime(),
            'e': 'trip',
            'vc': UUID.totalDailyVisit(),
            'tvc': UUID.totalVisit(),
            'name':'Trip'
        };
    }, getPageViewInfo() {
        return {
            ...this.getDocumentInfo(),
            'type': CONSTANTS.PAGE_VIEW_EVENT,
            'm': UUID.getMachineId(),
            'v': UUID.getVisitorId(),
            't': new Date().getTime()
        };
    }, getUUIdInfo() {
        return {
             'type': CONSTANTS.PAGE_USER_INFO,
            'm': UUID.getMachineId(),
            'v': UUID.getVisitorId(),
            't': new Date().getTime()
        };
    },
    mapKey:function(key){
      key=key.toLowerCase();
      if(DataStore.keyMap[key]) return DataStore.keyMap[key];
      return  key;
    },
    getDocumentInfo: function () {
        let copyKeyDocument = ['location', 'title', 'URL']; //'activeElement',
        let _document = {};
        for (let i in window.document) {
            if (copyKeyDocument.indexOf(i) !== -1 && window.document[i]) {
                _document[DataStore.mapKey(i)] = window.document[i];

                if (isNestedObject(window.document[i])) {
                    {
                        _document[DataStore.mapKey(i)] ={};
                       // _document[DataStore.mapKey(i)] ={...window.document[i]};

                         for (let j in window.document[i]) {
                            if (!isNestedObject(window.document[i][j]))
                                _document[DataStore.mapKey(i)][DataStore.mapKey(j)] = window.document[i][j];
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
                _navigator[DataStore.mapKey(i)] = navigator[i];

                if (isNestedObject(navigator[i])) {
                    _navigator[DataStore.mapKey(i)] ={};
                     for (let j in navigator[i]) {
                        //if (!isNestedObject(_navigator[DataStore.mapKey(i)][j]))
                            _navigator[DataStore.mapKey(i)][DataStore.mapKey(j)] = navigator[i][j];
                    }
                }
            }

        }
        if (navigator["connection"]) {
            _navigator["cn"] = {
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
            'e': 'first_view',
            'name':'Mac'

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