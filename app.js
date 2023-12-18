import express from "express";
import rateLimit from "express-rate-limit";
import cors from 'cors';
import dotenv from "dotenv";
import { userRouter } from "./routes/user-routes.js";
import {jobRouter} from "./routes/job-routes.js"

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT;
const HOST = process.env.HOST;

const app = express();

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

// Middleware to parse JSON in the request body
app.use(express.json());

// Middleware to parse URL-encoded data in the request body
app.use(express.urlencoded({ extended: true }));


app.use("",userRouter);
app.use("",jobRouter);


app.listen(PORT, HOST, () => {
  console.log(`Connected to the DataBase. Server is running at http://${HOST}:${PORT}`);
});
