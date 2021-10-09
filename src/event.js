import HttpAction from "./httpAction";
import Config from "./config";
import UUID from "./uuid";
import CONSTANTS from "./constants";
import Job from "./job";
import Logger from "./logger";
import DataStore from "./dataStore";

let server_url = Config.userConfig['server'] + CONSTANTS.API.EVENT;

const Event = {
    eventQueue: [],
    push_raw: function (args) {
        __LOCAL__ && Logger.log('Event push_raw', args);

        let argz = {...args};
        argz['t'] = new Date().getTime();
        argz['v'] = UUID.getVisitorId();
        argz['m'] = UUID.getMachineId();
        argz = DataStore.flat(argz);
        Event.eventQueue.push(argz);
        if (Event.eventQueue.length === 1) {
            __LOCAL__ && Logger.log('Event Queued');
            Job.submit(function () {
                const queue = Event.eventQueue;
                Event.eventQueue = [];
                __LOCAL__ && Logger.log('Event Job Requested', queue);
                const completeJob = new Promise((resolve, reject) => {
                    __LOCAL__ && Logger.log('Event Job Complete');
                    resolve();
                });
                return Promise.all([HttpAction.post(server_url, queue, false), completeJob]);
            });
        } else {
            __LOCAL__ && Logger.log('Event Already Queued');
        }
    },
    push: function (event_name, args) {
        __LOCAL__ && Logger.log('Event push ' + event_name, args);

        let argz = {...args};
        argz['e'] = event_name;
        argz['type'] = CONSTANTS.GENERAL_EVENT;
        Event.push_raw(argz);
    }

};
export default Event