import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 5000 });

let senderSocket: WebSocket | null = null;
let receiverSocket: WebSocket | null = null;
wss.on("connection", (ws) => {
  console.log("socket connected");
  // Catching the "close" event
  ws.on("close", () => {
    console.log("socket disconnected");
    // You can also perform additional cleanup here if needed
    if (ws === senderSocket) {
      console.log("Sender socket disconnected");
      senderSocket = null; // Reset senderSocket to null or handle cleanup
    }
    if (ws === receiverSocket) {
      console.log("Receiver socket disconnected");
      receiverSocket = null; // Reset receiverSocket to null or handle cleanup
    }
  });
  ws.on("message", (data: any) => {
    console.log("typeof", typeof data);
    const message: { type: string; sdp: any; candidate: any } =
      JSON.parse(data);
    if (message.type === "sender") return (senderSocket = ws);
    if (message.type === "receiver") return (receiverSocket = ws);

    if (message.type === "offer") {
      if (ws !== senderSocket) return;
      console.log("offer");
      return receiverSocket?.send(JSON.stringify(message));
    }

    if (message.type === "answer") {
      console.log("answer");
      if (ws !== receiverSocket) return;
      return senderSocket?.send(JSON.stringify(message));
    }

    if (message.type === "iceCandidate") {
      console.log("ice candidate");
      if (ws === senderSocket) {
        return receiverSocket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
        );
      }
      if (ws === receiverSocket) {
        return senderSocket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
        );
      }
    }
  });
});
