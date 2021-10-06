import Config from "./config";

const GlobalEvent = {
    fireEvent: function (name, data) {
        Config.log('global-fireEvent', name, data)
    }
};
export default GlobalEvent