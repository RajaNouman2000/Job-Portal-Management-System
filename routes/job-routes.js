import express from 'express';
import multer from "multer";
import {
    createJob,
    updateJobStatus
  }
  from "../controller/job.js";

// Set up multer for handling file uploads
const storage = multer.memoryStorage(); // You can change this to diskStorage if you want to save files to disk
const upload = multer({ storage: storage });
  
export const jobRouter = express.Router();

jobRouter.post("/applyjob",
upload.fields([{ name: 'cv' }]), createJob);


jobRouter.patch("/updatejobstatus", updateJobStatus);


export default { jobRouter };