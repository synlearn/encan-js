import HttpAction from "./httpAction";
import Config from "./config";

const Event = {
    push: function (event_name, args) {
        Job.submit(HttpAction.post(Config.event_url, args))
    }

};
export default Event