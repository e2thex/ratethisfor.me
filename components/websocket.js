"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
var ws_1 = require("ws");
var WS = ws_1["default"];
var WSS = ws_1.WebSocketServer;
var wss = new ws_1.WebSocketServer({ port: 8080 });
var groups = {};
wss.on('connection', function (ws) {
    ws.on('message', function (message, isBinary) {
        console.log('received: %s', message);
        var _a = JSON.parse(message.toString()), action = _a.action, group = _a.group, data = __rest(_a, ["action", "group"]);
        if (action === 'join') {
            if (!groups[group])
                groups[group] = [];
            groups[group].push(ws);
        }
        if (action === 'update' || action === 'requestUpdates') {
            groups[group].forEach(function (client) {
                if (client !== ws)
                    client.send(message, { binary: isBinary });
            });
        }
    });
});
console.log("listening on 8080");
