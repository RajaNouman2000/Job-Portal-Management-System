import express from "express";
import rateLimit from "express-rate-limit";
import cors from 'cors';
import cron from "node-cron";
import dotenv from "dotenv";
import  {Server} from "socket.io"
import http from "http"
import { userRouter } from "./routes/user-routes.js";
import {jobRouter} from "./routes/job-routes.js"
import {activityRouter} from "./routes/activity-routes.js"
import {softdelete} from "./controller/job.js"
// import { initializeSocket } from "./web-scokets/scoket.js";
import { makeRequest } from "./web-scokets/chatgpt.js";
import  {ChatData} from  "./model/chat.js"



import {checkUser} from "./middleware/check-user.js"
// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT;
const HOST = process.env.HOST;

const app = express();
const server = http.createServer(app);
const io = new Server(server);


// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON in the request body
app.use(express.json());

// Middleware to parse URL-encoded data in the request body
app.use(express.urlencoded({ extended: true }));


const limiter = rateLimit({
  windowMs: 60 * 1000, // one minute
  max: 10, // max 10 requests
  message: "Too many request(s) from this IP, Please try again later",
});

// global rate limiter middlware for all routes
app.use(limiter);

app.use("/user",userRouter);
app.use("/admin",activityRouter);
app.use("/job",jobRouter);


cron.schedule("*/30 * * * *", async () => {
  console.log("Running cron job...");
  try {
    const rejectedJobApplicant = await softdelete();
    console.log(rejectedJobApplicant);
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});


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
      socket.emit('chat message', gptResponse);
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

server.listen(PORT, HOST, () => {
  console.log(`Connected to the DataBase. Server is running at http://${HOST}:${PORT}`);
});
