import Config from "./config";
import Logger from "./logger";
import Event from "./event";
import UUID from "./uuid";
import DataStore from "./dataStore";

const GlobalEvent = {
    fireEvent: function (name, data) {
        __LOCAL__ &&  Logger.log('global-fireEvent', name, data);
        if (name === 'click') {
            let target = data;
            let value = target.getAttribute(Config.userConfig.track_action);
            if (value) {
                let exportData = {'name': value};
                let attributeName = Config.userConfig.track_action_parameters;
                let i = 1;
                let value_attribute = target.getAttribute(attributeName + i);
                let value_id = target.getAttribute(attributeName +'id');
                if (value_id) {
                    __LOCAL__ &&  Logger.log('global-fireEvent id attribute', name, data);
                    exportData['id'] = value_id;
                }
                while (value_attribute) {
                    exportData['attribute_' + i] = value_attribute;
                    value_attribute = target.getAttribute(attributeName + (++i));
                }
                Event.push('action', exportData)
            }

        }
    },
    pageView: function () {
        __LOCAL__ && Logger.log('pageView called');
        Event.push('page_view', {name: 'page_view', ...DataStore.getPageViewInfo()});
    }
};
export default GlobalEvent