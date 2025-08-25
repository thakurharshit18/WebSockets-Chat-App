"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
//event handler
wss.on("connection", function (socket) {
    console.log("user connected");
    socket.send("Hello Harshit Chauhan");
    socket.on("message", (e) => {
        if (e.toString() === "ping") {
            socket.send("yes i server and received your call");
        }
    });
});
