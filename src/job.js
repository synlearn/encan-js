import GlobalEvent from "./globalEvent";
import Config from "./config";
import Logger from "./logger";

const Stack = require("./stack").Stack;
let registerJob = null;
const Job = {
    submit: function (fnTask) {
        Stack.push(fnTask);
    },
    submitRegisterJob: function (fnTask) {
        registerJob =  fnTask ;
    },
    process: function () {
        setTimeout(function () {
            Logger.log("Calling Process");

            if (!Config.registered) {
                if (registerJob) {
                    Logger.log("Processing call Register Task");
                    registerJob().then(() => Logger.log("Register Success"))
                        .catch(reason => Logger.log("Register Failed"));
                }

                Logger.log("Server Not Registered , skip processing");
                return;
            }

            if (Stack.isEmpty()) {
                Logger.log("Calling Process : Stack is empty");
                return;
            }
            const task = Stack.pop();


            task && task().then(function (success, err) {
                if (!success)
                    Stack.push(task);
                GlobalEvent.fireEvent('job', {status: success, arg: err});

            }).catch(function (err) {
                Stack.push(task);
                GlobalEvent.fireEvent('job', {status: false, arg: err});
            });
        }, 100);
    }
};

let timer = setInterval(function () {
    Job.process();
}, Config.userConfig.process_timer);

export default Job