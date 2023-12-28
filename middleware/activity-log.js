import { sendApiError } from "../helper_function/response-api.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { LogModel } from "../model/logs.js";
import { User } from "../model/user.js";

// Load environment variables from .env file
dotenv.config();
const SECRETKEY = process.env.SECRETKEY;
const HOST = process.env.SECRETKEY;
const PORT = process.env.SECRETKEY;

// Helper function to check if the status code is in the 2xx range
function is2xxStatus(statusCode) {
  return statusCode >= 200 && statusCode < 300;
}

function checkUrl(req, statusCode) {
  const requestUrl = req.path;
  console.log(requestUrl)

  // Check conditions based on the request URL
  if (requestUrl.includes("/auth/login")) {
    return is2xxStatus(statusCode) ? "User Login Successfully" : "Login Failed";
  } else if (requestUrl.includes("/auth/create-user")) {
    return is2xxStatus(statusCode) ? "User created successfully" : "User creation failed";
  } else if (requestUrl.includes("/auth/verify-user")) {
    return is2xxStatus(statusCode) ? "User has verified successfully" : "User verification failed";
  } else if (requestUrl.includes("/user/get-users")) {
    return is2xxStatus(statusCode) ? "User list fetched successfully" : "Failed to fetch user list";
  } else if (requestUrl.includes("/auth/set-password")) {
    return is2xxStatus(statusCode) ? "Password set successfully" : "Failed to set password";
  } else if (requestUrl.includes("/auth/change-password")) {
    return is2xxStatus(statusCode) ? "Password changed successfully" : "Failed to change password";
  } else if (requestUrl.includes("/auth/forget-password")) {
    return is2xxStatus(statusCode) ? "Email sent for verification" : "Failed to send email for verification";
  } else if (requestUrl.includes("/auth/reminder-email")) {
    return is2xxStatus(statusCode) ? "Reminder email sent" : "Failed to send reminder email";
  } else if (requestUrl.includes("/submit-form")) {
    return is2xxStatus(statusCode) ? "Form submitted successfully" : "Failed to submit form";
  } else if (requestUrl.includes("/update-applicants")) {
    return is2xxStatus(statusCode) ? "User status updated successfully" : "Failed to update user status";
  } else if (requestUrl.includes("/get-applicants")) {
    return is2xxStatus(statusCode) ? "Applicant list fetched successfully" : "Failed to fetch applicant list";
  } else if (requestUrl.includes("/download-cv")) {
    return is2xxStatus(statusCode) ? "CV downloaded successfully" : "Failed to download CV";
  } else if (requestUrl.includes("/activity-logs")) {
    return is2xxStatus(statusCode) ? "Activity logs fetched successfully" : "Failed to fetch activity logs";
  } else {
    // Default message if no specific condition is met
    return "Not Valid Path";
  }
}

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
          logData.message =checkUrl(req, res.statusCode);

         
          console.log(logData.message);
          await LogModel.create(logData);
          //   console.log(logData)
        });

        // Continue with the Express middleware chain
        next();
      } else {
        res.on("finish", async () => {
          logData.statusCode = res.statusCode;
          logData.message =checkUrl(req, res.statusCode);
          await LogModel.create(logData);
        });
        next();
      }
    } else {
      res.on("finish", async () => {
        logData.statusCode = res.statusCode;
        logData.message =checkUrl(req, res.statusCode);
        await LogModel.create(logData);
      });

      next();
    }
  } catch (error) {
    res.on("finish", async () => {
      logData.statusCode = res.statusCode;
      logData.message =checkUrl(req, res.statusCode);
      await LogModel.create(logData);
    });

    next(error);
  }
};

export default activityLog;
