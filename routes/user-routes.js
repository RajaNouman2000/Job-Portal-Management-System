import express from 'express'
import {
    createUser,
    verifyEmail,
    handleSetPassword,
    getUser,
    login,
    forgetPassword,
    changePassword,
    remainderEmail
  }
  from "../controller/user.js";

import { adminAutherization} from "../middleware/admin-autherization.js"
import { activityLog } from "../middleware/activity-log.js"
import {userAutherization} from "../middleware/user-autherization.js"
  
export const userRouter = express.Router();

userRouter.post("/auth/login" ,login);
userRouter.post("/auth/create-user", adminAutherization,createUser)
userRouter.get("/auth/verify-user", verifyEmail);
userRouter.get("/user/get-users",userAutherization, getUser);
userRouter.patch("/auth/set-password", handleSetPassword);
userRouter.patch("/auth/change-password", changePassword);
userRouter.patch("/auth/forget-password" , forgetPassword);
userRouter.get("/auth/reminder-email", userAutherization,remainderEmail);


export default {userRouter};