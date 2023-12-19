import express from 'express';
import multer from "multer";
import {
    createJob,
    updateJobStatus,
    getJob,
    downloadCv
  }
  from "../controller/job.js";

import {checkUser} from "../middleware/check-user.js"
import {logRequest } from "../middleware/logs.js"
import {LogModel,logger} from "../service/logger.js";

// Set up multer for handling file uploads
const storage = multer.memoryStorage(); // You can change this to diskStorage if you want to save files to disk
const upload = multer({ storage: storage });
  
export const jobRouter = express.Router();

jobRouter.use((req, res, next) => {
  console.log(req.user)
  const logData = {
    userAgent: req.headers['user-agent'],
    endpoint: req.url,
    method: req.method,
    userName: req.user ? req.user.userName : '', // Add username from req.user
    email: req.user ? req.user.email : '', // Add email from req.user
    reqBody: req.body,
  };
  let responseSent = false;

  res.on('finish', () => {
    if (!responseSent) {
      logData.statusCode = res.statusCode;
      logData.resBody = res.body;

      LogModel.create(logData)
        .then(() => {
          responseSent = true;
          next();
        })
        .catch((error) => {
          console.error('Error saving log entry to Sequelize:', error);
          next();
        });
    }
  });
  // Continue with the Express middleware chain
  next();
});

jobRouter.post("/apply-job",
upload.fields([{ name: 'cv' }]),createJob);

jobRouter.patch("/update-job-status",checkUser,updateJobStatus);
jobRouter.get("/get-job-applicants",checkUser,getJob);
jobRouter.post("/download-cv",checkUser,downloadCv);

export default { jobRouter };