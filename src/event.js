import HttpAction from "./httpAction";
import Config from "./config";

const Event = {
    isLocalMode: function () {
        return process.env.NODE_ENV !== 'production';
    },
    push: function (event_name, args) {
        Job.submit(HttpAction.post(Config.event_url, args))
    }

};
export default Event