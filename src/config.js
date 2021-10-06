const Config = {
    isLocalMode: function () {
        return process.env.NODE_ENV !== 'production';
    },
    log:function(){
        if (Config.isLocalMode())
            console.log(arguments);
    },
    registered: false,
    userConfig: {
        track_all: false,
        click_track_class: 'encan-track',
        process_timer:1000,
       server:'',
        event_url:'',

    },
};
export default Config