import { sendApiError } from "../helper_function/response-api.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { LogModel } from "../model/logs.js";
import { User } from "../model/user.js";

// Load environment variables from .env file
dotenv.config();
const SECRETKEY = process.env.SECRETKEY;
const HOST= process.env.SECRETKEY;
const PORT = process.env.SECRETKEY;

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
          const message = activityMessage()

          function activityMessage() {
           const msg = checkUrl()
            let message = `${logData.userName} has ${msg}`;
          
            // Check if there is an error in the response
            if (res.statusCode <= 300) {
              // Include the error message in the log message
              message += ` encountered an error: ${res.statusMessage}`;
              cosn
            } else {
              // Add other success messages or additional information here
            }
          
            return message;
          }

          function checkUrl() {
            const requestUrl = req.path;
            
            // Check conditions based on the request URL
            if (requestUrl.includes("/api/auth/verify-user")) {
              return `created User ${req.body.firstName} ${req.body.lastName} successFuly`;
            } else if (requestUrl.includes("/api/auth/login")) {
              return "accessed another endpoint";
            } else if (requestUrl.includes("/api/auth/create-user")) {
              return "accessed another endpoint";
            }  else if (requestUrl.includes("/api/auth/set-password")) {
              return "accessed another endpoint";
            }  else if (requestUrl.includes("/api/applicant/submit-form")) {
              return "accessed another endpoint";
            }  else if (requestUrl.includes("/api/auth/forget-password")) {
              return "accessed another endpoint";
            }  else if (requestUrl.includes("/api/user/get-users")) {
              return "accessed another endpoint";
            }  else if (requestUrl.includes("/api/applicant/update-applicants")) {
              return "accessed another endpoint";
            }  else if (requestUrl.includes("/api/applicant/get-applicants")) {
              return "accessed another endpoint";
            }  else if (requestUrl.includes("/api/applicant/download-cv")) {
              return "accessed another endpoint";
            }  else if (requestUrl.includes("/api/log/activity-logs")) {
              return "accessed another endpoint";
            }  else if (requestUrl.includes("/api/auth/verify-user")) {
              return "accessed another endpoint";
            }  else if (requestUrl.includes("/api/auth/login")) {
              return "accessed another endpoint";
            }  else if (requestUrl.includes("/api/auth/login")) {
              return "accessed another endpoint";
            }  else if (requestUrl.includes("/api/auth/login")) {
              return "accessed another endpoint";
            }  else if (requestUrl.includes("/api/auth/login")) {
              return "accessed another endpoint";
            }else {
              // Default message if no specific condition is met
              return "performed an action";
            }
          }
          console.log(message)
          await LogModel.create(logData);
        //   console.log(logData)
        });

        // Continue with the Express middleware chain
        next();
      } else {
        res.on("finish",async () => {
            logData.statusCode = res.statusCode;
            await LogModel.create(logData);
          });
        next()
      }
     
    } else {
    
      res.on("finish", async () => {
        logData.statusCode = res.statusCode; 
        await LogModel.create(logData);
      });

      next();

    }
  } catch (error) {
    res.on("finish", async () => {
        logData.statusCode = res.statusCode;
        await LogModel.create(logData);
      });

   next(error)

  }
};

export default  activityLog ;
