import { sendApiError } from "../helper_function/response-api.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { LogModel } from "../model/logs.js";
import { User } from "../model/user.js";

// Load environment variables from .env file
dotenv.config();
const SECRETKEY = process.env.SECRETKEY;

export const activityLog = async (req, res, next) => {
    // console.log("activityLog")
  const lastLogEntry = await LogModel.max("id");
  const logId = lastLogEntry ? lastLogEntry + 1 : 1;

  req.logEntry = {
    logId: lastLogEntry ? lastLogEntry + 1 : 1,
  };

  const logData = {
    userAgent: req.headers["user-agent"],
    endpoint: req.url,
    method: req.method,
    reqBody: req.body,
  };

  try {
    const token = req.headers.authorization;
    console.log(token)

    if (token) {
      // Verify the token
      const decodedToken = jwt.verify(token.slice(7), SECRETKEY);
      // Check if the user exists
      const user = await User.findOne({
        where: {
          id: decodedToken.userId,
        },
      });

      if (user) {
        // console.log(user)
        logData.userName = user.firstName + user.lastName;
        logData.email = user.email; 

        res.on("finish", async () => {
          logData.statusCode = res.statusCode;
          logData.resBody = res.body; // Now you can access the response body
          await LogModel.create(logData);
        //   console.log(logData)
        });

        // Continue with the Express middleware chain
        next();
      } else {
        res.on("finish",async () => {
            logData.statusCode = res.statusCode;
            logData.resBody = res.body; 
            await LogModel.create(logData);
          });
        next()
      }
     
    } else {
    
      res.on("finish", async () => {
        logData.statusCode = res.statusCode;
        logData.resBody = res.body; 
        await LogModel.create(logData);
      });

      next();

    }
  } catch (error) {
    res.on("finish", async () => {
        logData.statusCode = res.statusCode;
        logData.resBody = res.body; 
        await LogModel.create(logData);
      });

   next(error)

  }
};

export default  activityLog ;
