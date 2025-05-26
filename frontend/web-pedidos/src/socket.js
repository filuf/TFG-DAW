import { io } from "socket.io-client";

const URL = import.meta.env.VITE_URL_NEST;

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(URL, {
      auth: {
        token: sessionStorage.getItem('token') || '',
      },
      reconnectionAttempts: Infinity, // reconexión infinita
      reconnectionDelay: 1000, // cada segundo
    });

    socket.on('connect_error', (err) => {
      console.error(`Connection error: ${err.message}`);
    });
  }

  return socket;
};
