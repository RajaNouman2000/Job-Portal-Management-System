import express from 'express'
import {
    createUser,
    verifyEmail,
    handleSetPassword,
    getUser,
    login,
    forgetPassword
  }
  from "../controller/user.js";

import { requiredAuth} from "../middleware/auth.js"
import {checkUser} from "../middleware/check-user.js"
import {logRequest } from "../middleware/logs.js"
  
export const userRouter = express.Router();

userRouter.post("/login",logRequest ,login);
userRouter.post("/create-user",requiredAuth,checkUser,logRequest ,createUser)
userRouter.get("/verify",logRequest , verifyEmail);
userRouter.get("/get-users", checkUser,logRequest , getUser);

userRouter.patch("/set-password",logRequest , handleSetPassword);
userRouter.patch("/forget-password",logRequest , forgetPassword);


export default {userRouter};