import express from 'express'
import {
    getActivityLogs
  }
  from "../controller/activity-logs.js";

import { adminAutherization} from "../middleware/admin-autherization.js"


export const activityRouter = express.Router();

activityRouter.get("/activity-logs",adminAutherization ,getActivityLogs);


export default {activityRouter};