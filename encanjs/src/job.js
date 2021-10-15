import GlobalEvent from "./globalEvent";
import Config from "./config";
import Logger from "./logger";
import UUID from "./uuid";

const Stack = require("./stack").Stack;
let registerJob = {};
const MAX_JOBS = 3;

window.addEventListener('beforeunload', function (event) {
    __LOCAL__ && Logger.log(`Submit Job beforeunload`);
    Job._processAllJobs();

});
window.addEventListener('unload', function (event) {
    __LOCAL__ && Logger.log(`Submit Job unload`);
    Job._processAllJobs();
});
const Job = {
    submit: function (fnTask) {
        Stack.push(fnTask);
    },
    submitToTop: function (fnTask) {
        Stack.pushTop(fnTask);
    },
    submitRegisterJob: function (numKey, fnTask) {
        __LOCAL__ && Logger.log(`Submit Register Job ${numKey}`, fnTask);
        registerJob[numKey] = fnTask;
    },
    _processAllJobs: function () {
        let rJobLength = Object.keys(registerJob).length;
        if (!UUID.isServerRegistered() || rJobLength > 0) {
            for (let i = 0; i < MAX_JOBS; i++) {
                __LOCAL__ && Logger.log("Processing call Register Task " + i);

                if (!UUID.isServerRegistered() && i>0) {
                    __LOCAL__ && Logger.log("Server Not Registered , skip page visit");
                    return;
                }

                if (registerJob[i]) {
                    (registerJob[i]()).then(() => {
                        delete registerJob[i];
                        __LOCAL__ && Logger.log(`Register Success , removing job ${i}`)
                    }).catch(reason => __LOCAL__ && Logger.log("Register Failed"));
                }
            }
            __LOCAL__ && Logger.log("Server Not Registered , skip processing");
            return;
        }

        if (Stack.isEmpty()) {
            //__LOCAL__ && Logger.log("Calling Process : Stack is empty");
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
    }, process: function () {
        setTimeout(function () {
            __LOCAL__ && Logger.log("Calling Process");
            Job._processAllJobs();
        }, 100);
    }
};

let timer = setInterval(function () {
    Job.process();
}, Config.userConfig.process_timer);

export default Job