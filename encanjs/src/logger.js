const Logger = {
    log: function () {
        if (__LOCAL__)
            console.log(...arguments);
    }, error: function () {
        if (__LOCAL__)
            console.error(...arguments);
    },
};
export default Logger