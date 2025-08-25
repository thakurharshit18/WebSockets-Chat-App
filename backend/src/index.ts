import { WebSocketServer } from "ws";


const wss = new WebSocketServer({port:8080});
//event handler
wss.on("connection",function(socket){
    console.log("user connected");
   
socket.send("Hello Harshit Chauhan");
socket.on("message",(e)=>{
  if(e.toString()==="ping"){
    socket.send("yes i server and received your call");
  }
})
})