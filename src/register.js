import Config from "./config";
import GlobalEvent from "./globalEvent";
import Logger from "./logger";
import Job from "./job";
import HttpAction from "./httpAction";
import UUID from "./uuid";
import DataStore from "./dataStore";


const Register = {
    registerServer: function (_register_data) {
        __LOCAL__ && Logger.log("registerServer ");
        const server_url = Config.userConfig['server'];
        return HttpAction.post(server_url, _register_data)
    },

    enqueueRegisterJob: function () {
        return Job.submitRegisterJob(Register.registerServer);
    },
    register: function (config) {
        Config.userConfig = {...Config.userConfig, ...config};
        __LOCAL__ && Logger.log("Register Called ", Config.userConfig);


        let _register_data = DataStore.getUserDeviceInfo();

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
            if (UUID.isNewCustomer() || !UUID.isRegistered()) {
                if (!Config.registered) {
                    Register.registerServer(_register_data).then(function (registered) {
                        UUID.setRegisterId(registered);
                        Config.registered = registered;
                    }).catch(function () {
                        Register.enqueueRegisterJob();
                    });
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