import React, { useEffect, useState } from "react";

const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [rtc, setRtc] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");
    setSocket(ws);
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "sender" }));
    };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "answer") {
        await rtc?.setRemoteDescription(message.sdp);
      }
      if (message.type === "iceCandidate") {
        await rtc?.addIceCandidate(message.candidate);
      }
    };

    return () => {
      ws.close();
      setSocket(null);
    };
  }, []);

  const handleSendingVideo = async () => {
    if (!socket) {
      alert("Socket not found");
      return;
    }

    const wrtc = new RTCPeerConnection();
    setRtc(wrtc);
    wrtc.onnegotiationneeded = async () => {
      const offer = await wrtc.createOffer();
      await wrtc.setLocalDescription(offer);
      socket.send(JSON.stringify({ type: "offer", sdp: offer }));
    };

    wrtc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: event.candidate,
          })
        );
      }
    };

    getCameraStreamAndSendVideo(wrtc);
  };

  const getCameraStreamAndSendVideo = async (wrtc: RTCPeerConnection) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement("video");
    video.srcObject = stream;
    document.body.appendChild(video);
    video.play();
    stream.getTracks().forEach((track) => {
      wrtc.addTrack(track);
    });
  };
  return (
    <div>
      <h1>Sender</h1> <br />
      <button onClick={handleSendingVideo}>Send Video</button>
    </div>
  );
};

export default Sender;
