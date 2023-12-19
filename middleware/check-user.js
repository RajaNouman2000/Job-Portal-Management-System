import { sendApiError } from "../helper_function/response-api.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import { User } from "../model/user.js";

// Load environment variables from .env file
dotenv.config();

const SECRETKEY = process.env.SECRETKEY;

export const checkUser = async (req, res, next) => {
  try {
   const token = req.headers.authorization;
  // const token = req.headers.token;

    if (token) {
      // Verify the token
      const decodedToken = jwt.verify(token, SECRETKEY);

      // Check if the user exists
      const user = await User.findOne({
        where: {
          id: decodedToken.userId,
        },
      });

      if (user) {
        // Attach user information to the request object
        req.user = {
          userId: user.id,
          email: user.email,
          userName: user.firstName + user.lastName,
          // Add any other user information you want to pass to the next middleware
        };

        console.log(req.user)

        // Continue with the Express middleware chain
        next();
      } else {
        sendApiError(res, "User not found", 401);
      }
    } else {
      sendApiError(res, "Token not provided", 401);
    }
  } catch (error) {
    console.error(error.message);
    sendApiError(res, "Invalid token", 401);
  }
};

export default { checkUser};
