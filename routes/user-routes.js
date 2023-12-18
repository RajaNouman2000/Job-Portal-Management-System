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
  
export const userRouter = express.Router();

userRouter.post("/login", login);
userRouter.post("/createuser",requiredAuth,createUser)
userRouter.get("/verify", verifyEmail);
userRouter.get("/getusers", getUser);

userRouter.post("/setpassword", handleSetPassword);
userRouter.post("/forgetpassword", forgetPassword);


export default {userRouter};