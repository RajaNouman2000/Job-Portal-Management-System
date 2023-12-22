// socket.js
import { Server } from "socket.io";
import express from "express";
import http from "http"

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log("A user connected");

  let user="user"
  socket.on('chat message', async (msg) => {
    console.log('message received from client: ' + msg);

    try {
      // Send user's message to OpenAI GPT-3.5 Turbo
      const gptResponse = await makeRequest({ body: { question: msg } });

      // Save GPT response to the database
      await ChatData.create({ userName: user+1, question: msg ,response:gptResponse});

      // Emit the GPT response back to the specific client
      socket.emit('chat message', {
        message: gptResponse,
        user: "bot"
      });
    } catch (error) {
      console.error('Error saving message to database:', error);
      // Handle the error (e.g., emit an error message to the client)
    }
  });

  // Disconnect event handler
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    // Additional disconnect logic if needed
  });
});

export default {initializeSocket}
