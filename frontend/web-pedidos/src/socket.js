import { io } from "socket.io-client";

const URL = import.meta.env.VITE_URL;

export const socket = io(URL, {
  reconnectionAttempts: Infinity, // reconexión infinita
  reconnectionDelay: 1000, // cada segundo
});

socket.on('connect_error', (err) => {
  console.error(`Connection error: ${err.message}`);
});