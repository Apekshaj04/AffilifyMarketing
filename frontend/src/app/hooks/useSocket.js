import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:8080";

export default function useSocket(walletAddress) {
  const [socket, setSocket] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!walletAddress) return; // Only connect if wallet address exists

    const newSocket = io(SOCKET_SERVER_URL);

    newSocket.on("connect", () => {
      console.log("✅ Connected to WebSocket:", newSocket.id);
      newSocket.emit("joinAffiliate", walletAddress);
    });

    newSocket.on("paymentNotification", (data) => {
      console.log("🔔 Notification Received:", data);
      setNotification(data); // Update notification state
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from WebSocket");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect(); // Cleanup on unmount
    };
  }, [walletAddress]);

  return { socket, notification };
}
