// socket.js
import { Server } from "socket.io";

let io; // Declare io variable outside the function to avoid re-creation

export const initializeSocket = (httpServer) => {
  if (!io) {
    io = new Server(httpServer);

    io.on('connection', (socket) => {
      console.log("A user connected");

      socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
      });
    });
  }
};

export default {initializeSocket}
