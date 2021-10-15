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
        try {
            return HttpAction.post(server_url + CONSTANTS.API.REGISTER, _register_data).then(function (response) {
                __LOCAL__ && Logger.log("registerServer response ", response);
                UUID.setServerRegisterId(response.data.registered);
            }).catch(function (e) {
                __LOCAL__ && Logger.error("Error  ", e);
                Job.submitRegisterJob(0, Register.registerServer);
            });
        } catch (e) {
            console.error(e)
        }
    },
    registerUid: function (uid) {
        let _register_data = DataStore.getUUIdInfo();
        _register_data['u'] = uid;
        __LOCAL__ && Logger.log("registerUid ", _register_data);
        const server_url = Config.userConfig['server'];
        try {

            return HttpAction.post(server_url + CONSTANTS.API.REGISTER_UUID, _register_data).then(function (response) {
                __LOCAL__ && Logger.log("registerUid response ", response);
            }).catch(function (e) {
                __LOCAL__ && Logger.error("Error  ", e);
                Job.submitRegisterJob(2, Register.registerUid);
            });
        } catch (e) {
            console.error(e)
        }
    },
    registerTrip: function () {
        let v_register_data = DataStore.getTripInfo();
        __LOCAL__ && Logger.log("register page view", v_register_data);
        const server_url = Config.userConfig['server'];
        try {
            return HttpAction.post(server_url + CONSTANTS.API.PAGE_VIEW, v_register_data).then(function (response) {
                __LOCAL__ && Logger.log("registerPageView response ", response);
                if (response && response.data)
                    UUID.setTripRegistered(response.data.registered);
            }).catch(function (e) {
                __LOCAL__ && Logger.error("Error  ", e);
                Job.submitRegisterJob(1, Register.registerTrip);
            });
        } catch (e) {
            console.error(e)
        }
    },
    register: function (config) {
        Config.userConfig = {...Config.userConfig, ...config};
        __LOCAL__ && Logger.log("Register Called ", Config.userConfig);


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
                    Register.registerTrip();

                }
            }
            if (!UUID.isPageViewRegistered()) {
                UUID.setPageViewRegistered(true);
                GlobalEvent.pageView(document.location)
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

const exporter = {
    create: Register.register,
    uid: Register.registerUid,
};
export default exporter;