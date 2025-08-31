"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let allsockets = [];
function broadcastRoomCount(roomId) {
    const count = allsockets.filter((u) => u.room === roomId).length;
    for (const u of allsockets) {
        if (u.room === roomId) {
            u.socket.send(JSON.stringify({
                type: "count",
                payload: { count },
            }));
        }
    }
}
wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === "join") {
            allsockets.push({ socket, room: parsedMessage.payload.roomId });
            console.log("user joined the room", parsedMessage.payload.roomId);
            socket.send(JSON.stringify({
                type: "system",
                payload: { message: `✅ Joined room ${parsedMessage.payload.roomId}` },
            }));
            broadcastRoomCount(parsedMessage.payload.roomId);
        }
        if (parsedMessage.type === "chat") {
            let currentUserRoom = null;
            for (const u of allsockets) {
                if (u.socket === socket) {
                    currentUserRoom = u.room;
                }
            }
            if (!currentUserRoom)
                return;
            for (const u of allsockets) {
                if (u.room === currentUserRoom) {
                    u.socket.send(JSON.stringify({
                        type: "chat",
                        payload: {
                            message: parsedMessage.payload.message,
                            clientId: parsedMessage.payload.clientId,
                        },
                    }));
                }
            }
        }
    });
    socket.on("close", () => {
        const user = allsockets.find((u) => u.socket === socket);
        if (user) {
            allsockets = allsockets.filter((u) => u.socket !== socket);
            broadcastRoomCount(user.room);
        }
    });
});
