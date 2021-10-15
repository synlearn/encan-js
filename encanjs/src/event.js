import HttpAction from "./httpAction";
import Config from "./config";
import UUID from "./uuid";
import CONSTANTS from "./constants";
import Job from "./job";
import Logger from "./logger";
import DataStore from "./dataStore";


const Event = {
    eventQueue: [],
    push_raw: function (args) {

        if (args['id']) {
            for (let j = Event.eventQueue.length - 1; j > -1; j--) {
                if ((Event.eventQueue[j]['id'] && args['id']) && (Event.eventQueue[j]['id'] === args['id']))
                    //Event.eventQueue[j] = args;
                    Event.eventQueue.splice(j, 1);

            }
        }

        __LOCAL__ && Logger.log('Event push_raw', args);
        args['t'] = new Date().getTime();
        args['v_id'] = UUID.getPageViewId();
        let argz = DataStore.flat(args);
        Event.eventQueue.push(argz);
        __LOCAL__ && Logger.log('Event Queued ');
        if (Event.eventQueue.length === 1) {
            Job.submit(function () {
                const queue = {data: Event.eventQueue};
                queue['v'] = UUID.getVisitorId();
                queue['m'] = UUID.getMachineId();
                Event.eventQueue = [];
                __LOCAL__ && Logger.log('Event Job Requested', queue);
                const completeJob = new Promise((resolve, reject) => {
                    __LOCAL__ && Logger.log('Event Job Complete');
                    resolve();
                });
                let server_url = Config.userConfig['server'] + CONSTANTS.API.EVENT;
                try {
                    return Promise.all([HttpAction.post(server_url, queue, false), completeJob]);
                } catch (e) {
                    console.error(e)
                }
            });
        } else {
            __LOCAL__ && Logger.log('Event Already Queued QueueSize::' + Event.eventQueue.length);
        }
    },
    push: function (event_name, args, uqid = null) {
        __LOCAL__ && Logger.log('Event push ' + event_name, args);

        let argz = {...args};
        if (!argz['e'])
            argz['e'] = event_name;
        if (!argz['type'])
            argz['type'] = CONSTANTS.GENERAL_EVENT;
        if (uqid)
            argz['id'] = uqid;
        Event.push_raw(argz);
    }

};
export default Event