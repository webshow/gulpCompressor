var config=require('./config');
var express = require('express');
var bodyParser=require('body-parser');
var webSocketServer = require('ws').Server;

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.post('/push', function (req, res) {
    var clientId = req.body.clientId;
    var msg = req.body.msg;
    sendWSMessage(clientId, msg);
    res.end();
});

app.listen(config.wsServerProxyPort, function () {
    console.log("ws proxy server is started.");
});

var wsClients = {};
var wss = new webSocketServer({port: config.wsServerPort});
console.log("ws server is started.");
wss.on("connection", function (ws) {
    ws.on('message', function (message) {
        if (message.indexOf('client_') != -1) {
            ws.clientId = message;
            wsClients[message] = ws;
        }
    });
    ws.on("error", function () {
        removeWSClient(ws.clientId);
    });
    ws.on("close", function () {
        removeWSClient(ws.clientId);
    });
});
function sendWSMessage(clientId, msg) {
    if (wsClients.hasOwnProperty(clientId)) {
        var ws = wsClients[clientId];
        try {
            ws.send(msg);
        } catch (e) {
            console.log("sendWSMessage error:" + e.message);
        }
    }
}
function removeWSClient(key) {
    if (wsClients.hasOwnProperty(key)) {
        delete wsClients[key];
    }
}