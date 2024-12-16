import React, { useEffect, useState } from "react";

const Receiver = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  console.log("scl", socket);
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");
    setSocket(ws);
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "receiver" }));
    };

    startReceiving(ws);
    return () => {
      ws.close();
      setSocket(null);
    };
  }, []);

  const startReceiving = async (socket: WebSocket) => {
    if (!socket) return;
    const video = document.createElement("video");
    document.body.appendChild(video);

    const wrtc = new RTCPeerConnection();

    socket.onmessage = async (event) => {
      console.log("coming here", event);

      const message = JSON.parse(event.data);

      if (message.type === "offer") {
        console.log("going here");

        await wrtc.setRemoteDescription(message.sdp);
        const ansSDP = await wrtc.createAnswer();
        await wrtc.setLocalDescription(ansSDP);
        socket.send(JSON.stringify({ type: "answer", sdp: ansSDP }));
        return;
      }
      if (message.type === "iceCandidate") {
        console.log("Receiver: received ice candidate");
        await wrtc.addIceCandidate(message.iceCandidate);
      }
    };

    wrtc.onicecandidate = (event) => {
      socket.send(
        JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
      );
    };

    wrtc.ontrack = async (event) => {
      console.log("Receiver: coming here in video");
      alert("Do you want to attend video");
      video.srcObject = new MediaStream([event.track]);
      await video.play();
    };
  };
  return <div>Receiver</div>;
};

export default Receiver;
