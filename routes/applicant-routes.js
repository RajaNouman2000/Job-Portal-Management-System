import express from 'express';
import multer from "multer";
import {
    createJob,
    updateJobStatus,
    getJob,
    downloadCv
  }
  from "../controller/applicants.js";

import { activityLog } from "../middleware/activity-log.js"
import {userAutherization} from "../middleware/user-autherization.js"
userAutherization
// Set up multer for handling file uploads
const storage = multer.memoryStorage(); // You can change this to diskStorage if you want to save files to disk
const upload = multer({ storage: storage });
  
export const jobRouter = express.Router();

jobRouter.post("/submit-form",
upload.fields([{ name: 'cv' }]),activityLog,createJob);

jobRouter.patch("/update-applicants",userAutherization,updateJobStatus);
jobRouter.get("/get-applicants",userAutherization,getJob);
jobRouter.post("/download-cv",userAutherization,downloadCv);

export default { jobRouter };