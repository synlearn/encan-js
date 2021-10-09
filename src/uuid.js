"use strict";
import Cookies from 'js-cookie'
import Config from "./config";
import {v4 as uuidv4} from 'uuid';
import Logger from "./logger";
import CONSTANTS from "./constants";

__LOCAL__ && Logger.log("Initializing UUID Module");


let now = new Date().getTime();
const todayStartDate = new Date();
todayStartDate.setHours(0, 0, 0, 0);
let todayStart = todayStartDate.getTime();
//let previousHourDate=new Date();
//previousHourDate.setHours(previousHourDate.getHours()+1);
let getVisitorId = () => CONSTANTS.VISITOR_UID_PREFIX + uuidv4();
let getMachineId = () => CONSTANTS.MACHINE_UID_PREFIX + uuidv4();
let oneHourMilli = 3600000;
let cookieKey = Config.userConfig.cookie_key;
let cookieMachineIdentifierKey = cookieKey + "3m";
let cookieVisitIdentifierKey = cookieKey + "2v";
let isLocalModeisLocalMode = __LOCAL__;

const machine_cookie_ttl = 365;
const visitor_cookie_ttl = new Date(new Date().setHours(24, 0, 0, 0));
const visit = {
    version: 0.10,
    first_visit: now,
    recent_visit: now,
    server_registered: false,
    total_visit: 0,
    updated: 0,
};

__LOCAL__ && Logger.log("Initializing Cookie Module");

const cookies = Cookies.withConverter({
    read: function (value, name) {
        console.log("read", value, name);
        return JSON.parse(!isLocalMode ? atob(value) : value);
        //return Cookies.converter.read(value, name)
    },
    write: function (value, name) {
        console.log("write", value, name);

        return (!isLocalMode ? (btoa(JSON.stringify(value))) : JSON.stringify(value));
    }
});

__LOCAL__ && Logger.log("Initializing Machine Cookie");


//initialize & save machine id
let machine = cookies.get(cookieMachineIdentifierKey);
let machine_id = (machine === undefined) ? getMachineId() : machine['uid'];
let machine_value = (machine === undefined) ? {...visit} : machine;

//assign
if (machine_value.updated !== todayStart) {
    __LOCAL__ && Logger.log("Updating Machine Cookie");
    machine_value.total_visit += 1;
    machine_value['uid'] = machine_id;
    machine_value.recent_visit = now;
    machine_value.updated = todayStart;
    let cookieOptions = {expires: machine_cookie_ttl};
    if (!isLocalMode) cookieOptions['secure'] = true;
    cookies.set(cookieMachineIdentifierKey, machine_value, cookieOptions);
    __LOCAL__ && Logger.log("Updating Visitor Cookie", machine_value);

}

__LOCAL__ && Logger.log("Initializing Visitor Cookie");

//initialize & save visitor id
let visitor = cookies.get(cookieVisitIdentifierKey);
let visitor_id = (visitor === undefined) ? getVisitorId() : visitor['uid'];
let visit_value = (visitor === undefined) ? {...visit} : visitor;

if ((now - visit_value.updated >= oneHourMilli) || now - visit_value.updated === 0) {
    __LOCAL__ && Logger.log("Updating Visitor Cookie");
    //assign
    visit_value['uid'] = visitor_id;
    visit_value.recent_visit = now;
    visit_value.updated = now;
    visit_value.total_visit += 1;
    let cookieOptions = {expires: visitor_cookie_ttl};
    if (!isLocalMode) cookieOptions['secure'] = true;
    cookies.set(cookieVisitIdentifierKey, visit_value, cookieOptions);
    __LOCAL__ && Logger.log("Updating Visitor Cookie", visit_value);

}

function registerServerId(registered) {
    let cookieOptions = {expires: machine_cookie_ttl};
    if (!isLocalMode) cookieOptions['secure'] = true;
    machine_value.server_registered = registered;
    cookies.set(cookieMachineIdentifierKey, machine_value, cookieOptions);
}

const UUID = {
    totalVisit: () => machine_value.total_visit,
    totalDailyVisit: () => visit_value.total_visit,
    isNewCustomer: () => (machine_value.total_visit + visit_value.total_visit) === 2,
    isRevisit: () => (machine_value.total_visit + visit_value.total_visit) > 2,
    getVisitorInfo: () => visit_value,
    getMachineInfo: () => machine_value,
    getMachineId: () => machine_value.uid,
    getVisitorId: () => visit_value.uid,
    isRegistered: () => visit_value.server_registered,
    setRegisterId: registerServerId,
};
export default UUID