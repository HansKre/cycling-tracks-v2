// import statements must run before anything else
import { handleLogin } from "./handleLogin";

const http = require('http');
const https = require('https');
const express = require("express");
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3080;
const portSsl = process.env.PORT_SSL || 30443;
const config = require('./config');

const sslConfig = require('./ssl-config');
const credentials = sslConfig(app, express);

var bodyParser = require("body-parser");

// Enable All CORS Requests for all routes
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// set custom process-title to allow stopping node-server during deployments
require('process').title = config.garminLoginServerProcessTitle;

const compression = require('compression');
// compress all responses
app.use(compression());

app.post('/api/login', async function (req, res) {
    console.log("/api/login", req.method, req.body);
    await handleLogin(req, res);
});

app.get("/", (req, res) => {
    res.send("It works!");
});

// http server
const httpServer = http.createServer(app);

httpServer.listen(port, () => {
    console.log(`Login-Server listening at http://localhost:${port}`);
});

// https server
if (credentials) {
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(portSsl, () => {
        console.log(`Login-Server listening at https://localhost:${portSsl}`);
    });
} else {
    console.log('Couldn\'t start HTTPS-Server due to missing credentials.');
}
