import Logger from "./logger";
import DataStore from "./dataStore";

const axios = require('axios');

const HttpAction = {
    post: function (server_url, data, flat = true) {
        const _data = data;
        if (flat)
            data = DataStore.flat(data);
        //data = JSON.stringify(data);
        //data = btoa(data);
        return new Promise((resolve, reject) => {
            __LOCAL__ && Logger.log('Http Action ', "POST", "server_url " + server_url, _data);
            if (!server_url || server_url.length < 5) {
                __LOCAL__ && Logger.log('server_url config attribute Required');
                reject('server_url config attribute Required');
                throw  new Error('server config attribute Required');
            }
            axios.post(server_url, data)
                .then(function (response) {
                    if (response['status'] === 200) {
                        __LOCAL__ && Logger.log('Http Action Success');
                        resolve(response.data);
                    } else {
                        __LOCAL__ && Logger.log('Http Action Failed');
                        reject('Server Returned ' + response['status']);
                    }
                })
                .catch(function (error) {
                    {
                        __LOCAL__ && Logger.log('Http Action Failed');
                        reject(error);
                    }
                });
        });
    },

};
export default HttpAction