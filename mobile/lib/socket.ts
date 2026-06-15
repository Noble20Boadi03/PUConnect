import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';

// Dynamically resolve the socket server URL (same as API URL but without /api)
const getSocketUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(':').shift() || 'localhost';
  
  if (__DEV__) {
    return `http://${localhost}:5000`;
  }
  
  return Constants.expoConfig?.extra?.socketUrl || 'https://api.puconnect.com';
};

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(getSocketUrl(), {
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
