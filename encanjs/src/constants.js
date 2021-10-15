const CONSTANTS = {
    MACHINE_UID_PREFIX: 'M',
    VISITOR_UID_PREFIX: 'V',
    REGISTER_EVENT: 'R',
    PAGE_VIEW_EVENT: 'V',
    PAGE_USER_INFO: 'U',
    TRIP_EVENT: 'N',
    GENERAL_EVENT: 'E',
    API: {
        EVENT: '/api/v1/encan/registerEvent',
        REGISTER: '/api/v1/encan/registerMachine',
        REGISTER_UUID: '/api/v1/encan/registerUid',
        PAGE_VIEW: '/api/v1/encan/registerTripx'
    }
};
export default CONSTANTS