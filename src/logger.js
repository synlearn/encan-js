const Logger = {
    isLocalMode: function () {
        return process.env.NODE_ENV !== 'production';
    },
    log:function(){
        if (Logger.isLocalMode())
            console.log(...arguments);
    }
};
export default Logger