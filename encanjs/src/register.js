import Config from "./config";
import GlobalEvent from "./globalEvent";
import Logger from "./logger";
import Job from "./job";
import HttpAction from "./httpAction";
import UUID from "./uuid";
import DataStore from "./dataStore";
import CONSTANTS from "./constants";


const Register = {
    registerServer: function () {
        let _register_data = DataStore.getUserDeviceInfo();
        __LOCAL__ && Logger.log("registerServer ", _register_data);
        const server_url = Config.userConfig['server'];
        return HttpAction.post(server_url + CONSTANTS.API.REGISTER, _register_data).then(function (registered) {
            UUID.setServerRegisterId(registered);
        }).catch(function () {
            Job.submitRegisterJob(0, Register.registerServer);
        });
    },
    registerPageView: function () {
        let v_register_data = DataStore.getPageViewInfo();
        __LOCAL__ && Logger.log("register page view", v_register_data);
        const server_url = Config.userConfig['server'];
        HttpAction.post(server_url + CONSTANTS.API.PAGE_VIEW, v_register_data).then(function (registered) {
            UUID.setPageViewRegistered(registered);
        }).catch(function () {
            Job.submitRegisterJob(1, Register.registerPageView);
        });
    },
    register: function (config) {
        Config.userConfig = {...Config.userConfig, ...config};
        __LOCAL__ && Logger.log("Register Called ", Config.userConfig);

        if (Config.isRealUserAgent && UUID.isServerRegistered() && !UUID.isPageViewRegistered()) {
            Register.registerPageView();
        }

        let _existingMapper = (document.onclick);
        document.onclick = function (event) {
            //call already allocated method if any
            if (_existingMapper)
                _existingMapper.call(this);

            //only register if user performs any action
            //skip any bot actions
            if (!Config.isRealUserAgent) {
                __LOCAL__ && Logger.log("Bot Agent Skip");
                return;
            }
            if (UUID.isNewCustomer() || !UUID.isServerRegistered()) {
                __LOCAL__ && Logger.log("Bot Agent Skip");

                if (!UUID.isServerRegistered()) {
                    Register.registerServer();
                    Register.registerPageView();

                }
            }


            // Compensate for IE<9's non-standard event model
            if (event === undefined) event = window.event;
            let target = 'target' in event ? event.target : event.srcElement;
            if (target && (Config.userConfig['track_all'] || (target.classList && target.classList.contains(Config.userConfig.click_track_class)))) {
                __LOCAL__ && Logger.log('clicked on ' + target.tagName, target);
                GlobalEvent.fireEvent('click', target)
            }
        };
    }
};
export default Register.register