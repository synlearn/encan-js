const Logger = {
    log: function () {
        if (__LOCAL__)
            console.log(...arguments);
    }
};
export default Logger