import { io, Socket } from 'socket.io-client';
import ENV from '../config';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(ENV.socketUrl, {
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
