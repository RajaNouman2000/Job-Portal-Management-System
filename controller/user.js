import { v4 } from "uuid";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import pkg from 'sequelize';
const { DataTypes, Sequelize ,Op} = pkg;


import { User, validateUser } from "../model/user.js";
import { emailVerification } from "../mail_verification/mail-verification.js";

import { setPasswordMail} from "../mail_verification/set-password.js";
import {sendApiError,sendApiResponse} from "../helper_function/response-api.js" 


// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT;
const HOST = process.env.HOST;
const SECRETKEY=process.env.SECRETKEY;

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({
            where: {
                email: email,
            },
        });

        if (!user) {
            return sendApiError(res, req.logEntry.logId,"Email or Password is Incorrect", 400);
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return sendApiError(res,req.logEntry.logId,"Email or Password is Incorrect", 401);
        }

        // Generate a JWT token that expires in 30 minutes
        const token = jwt.sign({ userId: user.id }, SECRETKEY, { expiresIn: '30m' });

        return sendApiResponse(res, { logid: req.logEntry.logId, token:token ,firstName:user.firstName,lastName:user.lastName,isAdmin:user.isAdmin}, "Login successfully");

    } catch (error) {
        return sendApiError(res,error.message,req.logEntry.logId);
    }
};

export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    const existingUser = await User.findOne({ where: { email: email } });

    if (existingUser) {
      // If the email exists, send an error response
      return sendApiError(res,"Email is already in use",req.logEntry.logId, 400);
    }
    
    // Validate user input
    const { error } = validateUser({ firstName, lastName, email });
    if (error) {
      return sendApiError(res, error.details[0].message, req.logEntry.logId,400);
      
    }

    const rememberToken = v4();
    const verificationTokenCreated = new Date();
    const result = await User.create({
      firstName,
      lastName,
      email,
      rememberToken: rememberToken,
      verificationTokenCreated: verificationTokenCreated,
    });

    emailVerification.add({
      to: email,
      subject: "Email Verification",
      html: `<div style="background-color: #F4F4F4; padding: 20px;">
        <h2 style="color: #333;">Verify your Email.</h2>
        <p style="color: #666;">Please tap the button below to verify your email:</p>
        <a href="http://${HOST}:${PORT}/api/auth/verify-user?token=${rememberToken}&email=${email}" style="text-decoration: none;">
          <div style="background-color: #3498DB; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            Set Password
          </div>
        </a>
      </div>`,
      type: "emailVerification",
    });

    return sendApiResponse(res,req.logEntry.logId, "User Created Successfully", 200);
  } catch (error) {
    return sendApiError(res, error.message,req.logEntry.logId);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;
    console.log(token)
    console.log(req.query)
    
  // Check if token and email are provided
    if (token==null || email==null) {
      return sendApiError(res,  "Token or email is null",req.logEntry.logId , 490);
    }

// Verify the token against the stored tokens in the database
    const user = await User.findOne({
      where: {
        rememberToken: token,
        email: email,
      },
    });

    if (!user) {
      return sendApiError(res, "Invalid email or Token",req.logEntry.logId, 400);
    }

     // Check if the token is expired (more than 30 minutes old)
     const currentTimestamp = new Date().getTime();
     const tokenCreationTimestamp = user.verificationTokenCreated.getTime();
     const timeDifferenceMinutes = (currentTimestamp - tokenCreationTimestamp) / (1000 * 60);
 
     if (timeDifferenceMinutes > 1) {
       return sendApiError(res, "Token is expired", req.logEntry.logId, 400);
     }

    await User.update(
      { rememberToken: null },
      { where: { email: user.email } }
    );

    // Assuming your frontend is hosted on the same origin
    const redirectUrl = `http://192.168.11.218:8080/#/CreatePassword?email=${email}`;

    // Send the redirect URL in the response
    return sendApiResponse(res, { LogId:req.logEntry.logId, email, redirectUrl },"Email verified successfully. Now you are redirecting to set password page.");

  } catch (error) {
    return sendApiError(res, error.message,{logid: req.logEntry.logId});
  }
};

export const remainderEmail = async (req, res) => {
  try {
    const {  email } = req.query;
    console.log(email)
    // Verify the token against the stored tokens in the database
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return sendApiError(res,req.logEntry.logId, "Invalid email or Token", 400);
    }
    user.rememberToken = v4()
    user.verificationTokenCreated = new Date()
    await user.save();

    emailVerification.add({
      to: email,
      subject: "Email Verification",
      html: `<div style="background-color: #F4F4F4; padding: 20px;">
        <h2 style="color: #333;">Verify your Email.</h2>
        <p style="color: #666;">Please tap the button below to verify your email:</p>
        <a href="http://${HOST}:${PORT}/api/auth/verify-user?token=${user.rememberToken}&email=${email}" style="text-decoration: none;">
          <div style="background-color: #3498DB; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            Set Password
          </div>
        </a>
      </div>`,
      type: "emailVerification",
    });

    // Send the redirect URL in the response
    return sendApiResponse(res, { LogId:req.logEntry.logId, email },"Email verified successfully. Now you are redirecting to set password page.");

  } catch (error) {
    return sendApiError(res, error.message,req.logEntry.logId);
  }
};

export const handleSetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, email } = req.body;

    // Verify the token against the stored tokens in the database
    if (email) {
      const user = await User.findOne({
        where: {
          email: email,
          rememberToken: null,
        },
      });
      if (!user) {
        return sendApiError(res, "Invalid email or user not verified. Please check your email for the verification link.",{ LogId:req.logEntry.logId}, 400);
      }

      if(password.length<8){
        return sendApiError(res, "Password should be 8 character or greater",req.logEntry.logId, 400);
      }

      if (password !== confirmPassword) {
        return sendApiError(res, "Password does not match",req.logEntry.logId, 400);
      }

      // Update the user's verification status
      await User.update(
        { isVerified: true },
        { where: { email: user.email } }
      );

     
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update the user's password
      await User.update(
        { password: hashedPassword },
        { where: { email: user.email } }
      );

      // Send a success response
      return sendApiResponse(res, { LogId:req.logEntry.logId },"Password set successfully. Your account is now verified. You can log in.");
    } else {
      return sendApiError(res,"Email not found",{ LogId:req.logEntry.logId }, 400);
    }

  } catch (error) {
    // Send an error response
    return sendApiError(res, error.message,{logid: req.logEntry.logId});
  }
};

export const forgetPassword = async (req, res) => {

  try {
    const { email } = req.body;
    // Verify the token against the stored tokens in the database
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return sendApiError(res, "Email not found. Please enter email.",{logid: req.logEntry.logId}, 400,);
    }
    setPasswordMail.add({
      to: email,
      subject: "Email Verification",
      html: `<div style="background-color: #F4F4F4; padding: 20px;">
      <h2 style="color: #333;">Set your Account Password.</h2>
      <p style="color: #666;">Please tap the button below to set  your account password:</p>
      <a href="http://192.168.11.218:8080/#/CreatePassword?email=${email}" style="text-decoration: none;">
          <div style="background-color: #3498DB; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block;">
              Set Password
          </div>
      </a></div>`,
      type: "emailVerification",
    });

    // Send a success response
    return sendApiResponse(res,  req.logEntry.logId,"Email has been sent successfully.");

  } catch (error) {
    // Send an error response
    return sendApiError(res, error.message, req.logEntry.logId);
  }
};

export const changePassword = async (req, res) => {
  
  try {
    const { email,oldPassword ,newPassword,confirmPassword } = req.body;

    // Verify the token against the stored tokens in the database
    if (email) {
      const user = await User.findOne({
        where: {
          email: email,
        },
      });
      if (!user) {
        return sendApiError(res, "Invalid email or user not verified. Please check your email for the verification link.",{ LogId:req.logEntry.logId}, 400);
      }

      // Compare the provided password with the hashed password in the database
      const checkPassword = await bcrypt.compare(oldPassword , user.password);  

      if (!checkPassword){
        return sendApiError(res, "Please enter correct password",req.logEntry.logId, 400);
      }

      if(newPassword.length<8){
        return sendApiError(res, "Password should be 8 character or greater",req.logEntry.logId, 400);
      }

      if (newPassword !== confirmPassword) {
        return sendApiError(res, "Password does not match",req.logEntry.logId, 400,);
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password
      await User.update(
        { password: hashedPassword },
        { where: { email: user.email } }
      );

      // Send a success response
      return sendApiResponse(res, req.logEntry.logId ,"Password change successfully");
    } else {
      return sendApiError(res,"Email not found",req.logEntry.logId , 400);
    }

  } catch (error) {
    // Send an error response
    return sendApiError(res, error.message, req.logEntry.logId);
  }
};

export const getUser = async (req, res) => {
  try {
      const { pageNumber = 1, perPage = 10, firstName, lastName, email, isAdmin, isVerified } = req.body;

      // Calculate the skip value based on the page number
      const skip = (pageNumber - 1) * perPage;

      // Build filter object based on provided query parameters
      const filter = {};
      if (firstName) {
          filter.firstName = { [Op.like]: `%${firstName}%` };
      }
      if (lastName) {
          filter.lastName = { [Op.like]: `%${lastName}%` };
      }
      if (email) {
          filter.email = { [Op.like]: `%${email}%` };
      }
      if (isAdmin) {
          filter.isAdmin = isAdmin === 'true';
      }
      if (isVerified) {
          filter.isVerified = isVerified === 'true';
      }

      // Fetch total count for pagination with applied filters
      const totalCount = await User.count({
          where: filter,
      });

      // Fetch records from the database using the calculated skip and limit values and applied filters
      const users = await User.findAll({
          attributes: ["id", "firstName", "lastName", "email", "isVerified", "isAdmin"],
          where: filter,
          offset: skip,
          limit: parseInt(perPage), // Convert perPage to an integer
      });

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / perPage);

      // Calculate next and previous page numbers
      const nextPage = pageNumber < totalPages ? parseInt(pageNumber) + 1 : null;
      const prevPage = pageNumber > 1 ? parseInt(pageNumber) - 1 : null;

      // Send the paginated list of users along with pagination details as a response
      return sendApiResponse(res, { LogId:req.logEntry.logId,  totalPages, perPage, pageNumber, nextPage, prevPage, users  }, "Paginated users fetched successfully", 200);

  } catch (error) {
      console.error("Error fetching paginated users:", error);
      return sendApiError(res,error.message,{logid: req.logEntry.logId});
  }
};

export default { createUser, verifyEmail,handleSetPassword ,forgetPassword, getUser,changePassword,remainderEmail};
