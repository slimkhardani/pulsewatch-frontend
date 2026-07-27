import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
  autoConnect: false,
});

socket.on('connect', () => {
  console.log('[socket] connected, id:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('[socket] disconnected:', reason);
});

socket.onAny((event, ...args) => {
  console.log('[socket] event received:', event, args);
});

export default socket;