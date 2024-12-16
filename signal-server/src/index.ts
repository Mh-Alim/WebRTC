import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 5000 });

let senderSocket: WebSocket | null = null;
let receiverSocket: WebSocket | null = null;
wss.on("connection", (ws) => {
  console.log("socket connected");

  ws.on("message", (data: any) => {
    if (data.type === "sender") return (senderSocket = ws);
    if (data.type === "receiver") return (receiverSocket = ws);

    if (data.type === "offer") {
      if (ws !== senderSocket) return;
      return receiverSocket?.send(data);
    }

    if (data.type === "answer") {
      if (ws !== receiverSocket) return;
      return senderSocket?.send(data);
    }
  });
});
