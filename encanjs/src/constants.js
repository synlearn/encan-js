const CONSTANTS = {
    MACHINE_UID_PREFIX: 'M',
    VISITOR_UID_PREFIX: 'V',
    REGISTER_EVENT: 'R',
    PAGE_VIEW_EVENT: 'V',
    GENERAL_EVENT: 'E',
    API:{
        EVENT:'/encan/api/register.json?type=event',
        REGISTER:'/encan/api/register.json',
        PAGE_VIEW:'/encan/api/register.json?type=page_view'
    }
};
export default CONSTANTS