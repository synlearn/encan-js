const express = require('express');
const Utils = require('../utils/utils');
const Api = require('../utils/apiUtil');
let router = express.Router();


router.get('/', (req, res) => {
    let k = -4544910014124141600029;
    res.send('Hello World 5588C9j!' + k);
});


router.post('/registerMachine', async (req, res) => {
    const driver = req.app.get('neo4j');

    // console.log("Register Machine", req.body);
    let params = {};
    let machineId = req.body.m;

    //{userId: "johnsmith", email: "john@smith.com", ...}
    Object.keys(req.body).forEach(function (k) {
        let value = req.body[k];
        if (Utils.isPrimitive(value)) {
            params[k] = value;
        }
    });

    console.log("Register Machine params");
    if (Object.keys(params).length > 0 && machineId) {
        //let cql = "CREATE (m:Machine) SET m = $params  RETURN m";

        let cql =
            `MERGE (X:Machine {m: '${machineId}'})
            ON CREATE
            SET X = $params
            ON MATCH
            SET X = $params
            RETURN X.m`;

        console.log("Running CQL ", cql);
        let createMachineNode = runCqlWithParam(driver, cql, params);
        promiseToResponse(createMachineNode, res)
            .then(() => console.log("Complete"))
            .catch((e) => {
                console.error(e);
                session.close()
            });
    }

});


function promiseToResponse(promise, res) {
    return new Promise((resolve, reject) => {
        console.log("promiseToResponse");

        promise.then(function (response) {
            console.log("promiseToResponse [response]");

            // do stuff with newly created user
            console.log(response);
            Api.ok.data(res, {registered: true});
            resolve(response);
        }, function (e) {
            // handle error
            reject(e);
            Api.error.custom(res, 4, {registered: false, error: e});
            console.error(e);
        });

    });

}

async function resolveSequentially(arr) {
    const results = [];
    for (const v of arr) {
        if (typeof v === 'function') {
            results.push(await v());
        } else {
            results.push(await v);
        }
    }
    return results;
}

function PromiseAllSequence(...params) {
    return params.reduce((p, fn) => p.then(fn), Promise.resolve())
}

function runCqlWithParam(driver, cqlVisitor, params) {
    return new Promise((resolve, reject) => {
        const session = driver.session();
        console.log(`Running CQL ${cqlVisitor}`);
        session.run(cqlVisitor, {params: params})
            .then(function (response) {
                console.log(`Running Complete CQL ${cqlVisitor}`);
                session.close();
                resolve(response);
            }, function (e) {
                console.log(`Running Error CQL ${cqlVisitor}`);
                session.close();
                reject(e);
                // handle error
                console.error(e);
            });
    });
}

router.post('/registerTripx', async (req, res) => {
    const driver = req.app.get('neo4j');

    console.log("Register Page Visit");
    let machineId = req.body.m;
    let visitorId = req.body.v;
    let visitTime = req.body.t;
    let params = {};
    //{userId: "johnsmith", email: "john@smith.com", ...}
    Object.keys(req.body).forEach(function (k) {
        let value = req.body[k];
        if (Utils.isPrimitive(value)) {
            params[k] = value;
        }
    });


    if (machineId && visitorId && Object.keys(params).length > 0) {

        //create machine id
        let cqlMachine =
            `MERGE (X:Machine {m: '${machineId}'})
                    ON CREATE
                    SET X.m = '${machineId}'
                    RETURN X.m`;
        // create visitor
        let cqlVisitor = `MATCH (m:Machine {m: '${machineId}'})
                            CREATE  (v:Session) SET v = $params RETURN v`;
        // create relationship
        let cqlRelationship = `MATCH (m:Machine), (v:Session)
                               WHERE m.m='${machineId}' AND v.v='${visitorId}'
                               MERGE (m)-[r:VISIT{t:${visitTime}}]->(v) 
                               RETURN type(r)`;

        let createVisitorNode =
            runCqlWithParam(driver, cqlMachine, {})
                .then(() => runCqlWithParam(driver, cqlVisitor, params))
                .then(() => runCqlWithParam(driver, cqlRelationship, {}));


        console.log("Staring to run");
        //let pageVisitADd = PromiseAllSequence( createMachineNode, createVisitorNode, createRelationship );
        //let arrayResult=resolveSequentially([createMachineNode, createVisitorNode, createRelationship ]);

        promiseToResponse(createVisitorNode, res)
            .then(() => console.log("Complete"))
            .catch((e) => {
                console.error(e);
            });


    }
});


router.post('/registerEvent', async (req, res) => {
    const driver = req.app.get('neo4j');

    let params = [];
    let PGView = null;
    Object.keys(req.body.data).forEach(function (k) {
        let value = req.body.data[k];
        if (Utils.isObject(value)) {
            if (value.e === 'page_view') {
                PGView = value;
            } else {
                params.push(value);
            }
        }
    });

    let visitorId = req.body.v;

    //create page view
    if (PGView) {
        let pageViewId = PGView.v_id;
        console.log(`Register Page View Event params `, PGView);
        let cqlPGView = `CREATE  (X:PGView) SET X =  $params RETURN X`;
        let cqlRelationship = `MATCH (X:PGView), (v:Session)
                               WHERE X.v='${visitorId}' AND v.v='${visitorId}' AND X.v_id='${pageViewId}'
                               MERGE (v)-[r:VIEW{t:v.t}]->(X) 
                               RETURN type(r)`;
        let createEventNode =
            await runCqlWithParam(driver, cqlPGView, PGView)
                .then(() => runCqlWithParam(driver, cqlRelationship, {}));
    }

    console.log(`Register Event params `, params);
    if (params.length > 0) {
        let cqlCreateEvent = ` UNWIND $params AS event CREATE  (X:Event) SET X = event RETURN X`;

        let cqlRelationship = `MATCH (X:Event), (v:PGView)
                               WHERE X.v_id=v.v_id 
                               MERGE (v)-[r:TRIGGER{t:v.t}]->(X) 
                               RETURN type(r)`;

        let createEventNode =
            runCqlWithParam(driver, cqlCreateEvent, params)
                .then(() => runCqlWithParam(driver, cqlRelationship, {}));

        promiseToResponse(createEventNode, res)
            .then(() => console.log("Complete registerEvent"))
            .catch((e) => {
                console.error(e);
            });
    }

});



router.post('/registerUid', async (req, res) => {
    const driver = req.app.get('neo4j');


    let machineId = req.body.m;
    let visitorId = req.body.v;
    let visitTime = req.body.t;
    let userId = req.body.u;


    console.log("Register UID params", req.body);
    if (machineId&&visitorId&&userId) {


        //let cqlCreateEvent = ` UNWIND $params AS event CREATE  (X:Event) SET X = event RETURN X`;

        /* let cqlRelationship = `MATCH (X:Machine), (V:Session), (E:Event), (K:PGView)
                                WHERE X.v='${visitorId}' AND V.v='${visitorId}' AND K.v='${visitorId}'
                                MERGE (X:Machine {uid: ${userId})
                                MERGE (V:Session {uid: ${userId})
                                MERGE (K:PGView {uid: ${userId})->(E:Event {uid: ${userId})
                                RETURN type(K)`; ,E.uid= '${userId}' */

        let cqlRelationship = `MATCH (X:Machine), (V:Session), (E:Event), (K:PGView) 
                               WHERE  V.v='${visitorId}' AND X.m=V.m and 
                                 K.v='${visitorId}'  AND    X.m='${machineId}'  AND 
                                 EXISTS( (X)-[:VISIT]-(V)) AND EXISTS( (K)-[:TRIGGER]-(E)) 
                               SET X.uid= '${userId}',V.uid= '${userId}',K.uid= '${userId}'
                               RETURN X`;
        let createEventNode =
            runCqlWithParam(driver, cqlRelationship, {});

        promiseToResponse(createEventNode, res)
            .then(() => console.log("Complete registerEvent"))
            .catch((e) => {
                console.error(e);
            });
    }

});

module.exports = router;