import { sendApiError, sendApiResponse } from "../helper_function/response-api.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import { User, validateUser } from "../model/user.js";

// Load environment variables from .env file
dotenv.config();

const SECRETKEY = process.env.SECRETKEY;

export const requiredAuth = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization;

    if (token) {
      // Verify the token
      const decodedToken = jwt.verify(token, SECRETKEY);

      // Check if the user exists and is an admin
      const existingUser = await User.findOne({
        where: {
          id: decodedToken.userId,
          isAdmin: true,
        },
      });

      if (existingUser) {
        // If the user is authenticated and is an admin, proceed to the next middleware
        next();
      } else {
        sendApiError(res, "Authenticated user is not an admin", 401);
      }
    } else {
      sendApiError(res, "Authentication token not provided. Redirecting to login.", 401);
    }
  } catch (error) {
    console.log(error.message);
    sendApiError(res, "Authentication failed. Redirecting to login.", 401);
  }
};

export default {requiredAuth};