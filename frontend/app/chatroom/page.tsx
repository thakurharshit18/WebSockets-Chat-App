"use client";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  text: string;
  self: boolean;
}

export default function Room() {
  const [clientId] = useState(() => Math.random().toString(36).slice(2));
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [mode, setMode] = useState<"choose" | "join" | "create">("choose");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "chat") {
          setChat((prev) => [
            ...prev,
            {
              text: data.payload.message,
              self: data.payload.clientId === clientId,
            },
          ]);
        } else if (data.type === "system") {
          setChat((prev) => [
            ...prev,
            { text: data.payload.message, self: false },
          ]);
        } else if (data.type === "count") {
          setUserCount(data.payload.count);
        }
      } catch {
        console.warn("Non-JSON message:", event.data);
      }
    };

    setWs(socket);
    return () => {
      socket.close();
    };
  }, [clientId]);

  const joinRoom = (id?: string) => {
    if (!ws) return;
    const targetRoom = id || roomId;
    if (!targetRoom) return;

    ws.send(JSON.stringify({ type: "join", payload: { roomId: targetRoom } }));
    setRoomId(targetRoom);
    setJoined(true);
  };

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    joinRoom(newRoomId);
  };

  const sendMessage = () => {
    if (!ws || !message) return;
    ws.send(
      JSON.stringify({
        type: "chat",
        payload: { message, clientId },
      })
    );
    setMessage("");
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      {!joined ? (
        <>
          {mode === "choose" && (
            <div className="flex flex-col gap-4 bg-gray-800 p-6 rounded-xl shadow-lg text-center">
              <h1 className="text-2xl font-bold mb-4">Welcome to Chat Rooms</h1>
              <button
                onClick={() => setMode("create")}
                className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Create Room
              </button>
              <button
                onClick={() => setMode("join")}
                className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Join Room
              </button>
            </div>
          )}

          {mode === "join" && (
            <div className="flex flex-col gap-4 bg-gray-800 p-6 rounded-xl shadow-lg">
              <h1 className="text-xl font-bold text-center">Join a Room</h1>
              <input
                className="p-3 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => joinRoom()}
                  className="bg-blue-600 flex-1 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Join
                </button>
                <button
                  onClick={() => setMode("choose")}
                  className="bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {mode === "create" && (
            <div className="flex flex-col gap-4 bg-gray-800 p-6 rounded-xl shadow-lg text-center">
              <h1 className="text-xl font-bold">Create a Room</h1>
              <p className="text-gray-300">Click below to generate a room</p>
              <button
                onClick={createRoom}
                className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Generate Room
              </button>
              <button
                onClick={() => setMode("choose")}
                className="bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Back
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col w-full max-w-lg h-[80vh] border border-gray-700 rounded-xl p-4 bg-gray-900 shadow-xl">
          <h2 className="text-lg font-semibold mb-1 text-center text-gray-300">
            Room: {roomId}
          </h2>
          <p className="text-center text-gray-400 text-sm mb-2">
            {userCount} {userCount === 1 ? "user" : "users"} in this room
          </p>
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {chat.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.self ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm sm:text-base shadow ${
                    msg.self
                      ? "bg-green-600 text-white rounded-br-none"
                      : "bg-gray-700 text-gray-100 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 p-3 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition text-white"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
