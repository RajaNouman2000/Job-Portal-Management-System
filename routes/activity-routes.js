import express from 'express'
import {
    getActivityLogs
  }
  from "../controller/activity-logs.js";

import { requiredAuth} from "../middleware/auth.js"
import {checkUser} from "../middleware/check-user.js"
import {logRequest } from "../middleware/logs.js"
  
export const activityRouter = express.Router();

activityRouter.get("/activity-logs",requiredAuth,checkUser,logRequest ,getActivityLogs);


export default {activityRouter};