import { sendApiError, sendApiResponse } from "../helper_function/response-api.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import { User } from "../model/user.js";

// Load environment variables from .env file
dotenv.config();

const SECRETKEY = process.env.SECRETKEY;

export const userAutherization = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    // const token = req.headers.authorization;
    const token = req.headers.authorization;
    if ( token ) {
      // Verify the token
      const decodedToken = jwt.verify(token.slice(7), SECRETKEY);

      // Check if the user exists
      const existingUser = await User.findOne({
        where: {
          id: decodedToken.userId,
        },
      });

      if (existingUser) {
        
        // Continue with the Express middleware chain
        next();
      } else {
        sendApiError(res, "Invalid user.", { logid: req.logEntry.logId });
      }
    } else {
      sendApiError(res, "Authorization token not provided", { logid: req.logEntry.logId });
    }
  } catch (error) {
    console.error(error.message);
    sendApiError(res, error.message, { logid: req.logEntry.logId });
  }
};

export default { userAutherization };
