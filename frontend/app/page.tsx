"use client";
import { useEffect, useRef, useState } from "react";


export default function Home() {
const [socket,setSocket] =useState();
const inputref = useRef();
  useEffect(()=>{
  const ws = new WebSocket("ws://localhost:8080");
  //@ts-ignore
  setSocket(ws); 
  ws.onmessage = (e)=>{
    alert(e.data);
  }
},[])
  const sendMessage = ()=>{
    const message = inputref.current.value;
   //@ts-ignore
    socket.send(message);
  }
  return (
  <div>
    Harshit Chauhan first websocket app
    <input ref={inputref} type="text" placeholder="message"/>
    <button onClick={sendMessage}>Submit </button>
  </div>
  );
}
