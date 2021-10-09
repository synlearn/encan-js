import Config from "./config";
import Logger from "./logger";
import Event from "./event";

const GlobalEvent = {
    fireEvent: function (name, data) {
        Logger.log('global-fireEvent', name, data);
        if (name==='click'){
            let target=data;
            let value = target.getAttribute(Config.userConfig.track_action);
            if (value){
                let exportData={'name':value};
                let attributeName=Config.userConfig.track_action_parameters;
                let i=1;
                let value_attribute = target.getAttribute(attributeName+ i);
                while (value_attribute){
                    exportData['attribute_'+ i]=value_attribute;
                    value_attribute = target.getAttribute(attributeName+ (++i));
                }
                Event.push('action',exportData)
            }
        }
    }
};
export default GlobalEvent