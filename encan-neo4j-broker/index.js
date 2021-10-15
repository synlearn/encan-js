const express = require('express');
const cors = require('cors');
const neo4j = require('neo4j-driver');
const encanRoutes = require('./routes/encan');
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 3000;



const user = "neo4j";
const password = process.env.password;
const host = "localhost";
const nport =7687 ;
const driver = neo4j.driver(`bolt://${host}:${nport}`, neo4j.auth.basic(user, password));
//const session = driver.session();



let corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};


app.set('neo4j',driver);
app.use(express.json())
app.use(cors(corsOptions));

// Import my test routes into the path '/test'

app.use('/api/v1/encan/', encanRoutes);

app.get('/clean', async (req, res) => {
    if (session)
        await session.close();
    // on application exit:
    await driver.close()



});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
