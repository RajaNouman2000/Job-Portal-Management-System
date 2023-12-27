import express from "express";
import rateLimit from "express-rate-limit";
import cors from 'cors';
import cron from "node-cron";
import dotenv from "dotenv";
import  {Server} from "socket.io"
import http from "http"
import { userRouter } from "./routes/user-routes.js";
import {jobRouter} from "./routes/applicant-routes.js"
import {activityRouter} from "./routes/activity-routes.js"
import {softdelete} from "./controller/applicants.js"
// import { initializeSocket } from "./web-scokets/scoket.js";
import { makeRequest } from "./web-scokets/chatgpt.js";
import activityLog  from "./middleware/activity-log.js"
import  {ChatData} from  "./model/chat.js"
import {createAdminUser} from  "./seeder/seed.js"
import user, { User } from "./model/user.js";
import jwt from "jsonwebtoken";




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
  max: 30, // max 10 requests
  message: "Too many request(s) from this IP, Please try again later",
});

// global rate limiter middlware for all routes
app.use(limiter);
app.use(activityLog)
app.use("/api/",userRouter);
app.use("/api/log/",activityRouter);
app.use("/api/applicant",jobRouter);


cron.schedule("*/30 * * * * *", async () => {
  console.log("Running cron job...");
  try {
    const rejectedJobApplicant = await softdelete();
    console.log(rejectedJobApplicant);
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

const SECRETKEY = process.env.SECRETKEY;

// Middleware function for Socket.IO
io.use(async (socket, next) => {
  try {
    console.log(socket.handshake.query.token);
    const token = socket.handshake.query.token;

    // Verify the token
    const decodedToken = jwt.verify(token, SECRETKEY);

    // Check if the user exists
    const user = await User.findOne({
      where: {
        id: decodedToken.userId,
      },
    });

    // If user doesn't exist, send an error
    if (!user) {
      return next(new Error('Invalid token'));
    }

    // Attach the user to the socket object
    socket.user = user;
    next();
  } catch (error) {
    console.error('Error in Socket.IO middleware:', error);
    next(error);
  }
});


io.on('connection', async (socket) => {
  try {
    // Access the user from the socket object
    const user = socket.user;

    console.log(`User ${user.firstName} ${user.lastName} connected`);

    socket.on('chat message', async (msg) => {
      console.log(`Message received from  ${user.firstName} ${user.lastName}: ${msg}`);
    
      try {
        // Send user's message to OpenAI GPT-3.5 Turbo
        const gptResponse = await makeRequest({ body: { question: msg } });

        // Save GPT response to the database
        await ChatData.create({ userName: user.firstName + user.lastName, question: msg, response: gptResponse });

        // Emit the GPT response back to the specific client
        socket.emit('chat message', gptResponse );
      } catch (error) {
        console.error('Error saving message to the database:', error);
        // Handle the error (e.g., emit an error message to the client)
      }
    });

    // Disconnect event handler
    socket.on('disconnect', () => {
      console.log(`User ${user.firstName} ${user.lastName} disconnected`);
      // Additional disconnect logic if needed
    });
  } catch (error) {
    console.error('Error in socket connection:', error);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Connected to the DataBase. Server is running at http://${HOST}:${PORT}`);
});
