import { v4 } from "uuid";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import pkg from 'sequelize';
import Joi from 'joi';
const { DataTypes, Sequelize ,Op} = pkg;


import { User, validateUser } from "../model/user.js";
import { emailVerification } from "../mail_verification/mail-verification.js";
import {sendApiError,sendApiResponse} from "../helper_function/response-api.js" 


// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT;
const HOST = process.env.HOST;
const SECRETKEY=process.env.SECRETKEY;

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email,password)
  try {
    const existingUser = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!existingUser) {
      return sendApiError(res, "Email or Password is Incorrect", 400);
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    if (!passwordMatch) {
      return sendApiError(res, "Email or Password is Incorrect", 401);
    }
  // Generate a JWT token that expires in 30 minutes
  const token = jwt.sign({ userId: existingUser.id }, SECRETKEY, { expiresIn: '30m' });

  sendApiResponse(res, { existingUser,token }, "Login successfully");

  } catch (error) {
    sendApiError(res, error, 500, "Internal Server Error: Unable to process the request. Please try again later.");
  }
};


export const getUser = async (req, res) => {
  try {
    const { pageNumber = 1, perPage = 10, firstName, lastName, email, isAdmin, isVerified } = req.query;

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
      attributes: ["id","firstName", "lastName", "email", "isVerified", "isAdmin"],
      where: filter,
      offset: skip,
      limit: perPage,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / perPage);

    // Calculate next and previous page numbers
    const nextPage = pageNumber < totalPages ? parseInt(pageNumber) + 1 : null;
    const prevPage = pageNumber > 1 ? parseInt(pageNumber) - 1 : null;

    // Send the paginated list of users along with pagination details as a response
    sendApiResponse(res, { message: { data: { totalPages, perPage, pageNumber, nextPage, prevPage, users } } }, "Paginated users fetched successfully", 200);

  } catch (error) {
    console.error("Error fetching paginated users:", error);
    sendApiError(res, error, 500, "Custom error message");
  }
};

export const createUser = async (req, res) => {
  console.log(req.body)
  try {
    const { firstName, lastName, email } = req.body;

    const existingUser = await User.findOne({ where: { email: email } });

    if (existingUser) {
      // If the email exists, send an error response
      sendApiError(res, "Email is already in use", 400);
      return;
    }
    // Validate user input
    const { error } = validateUser({ firstName, lastName, email });
    if (error) {
      sendApiError(res, error.details[0].message, 400);
      return;
    }

    const rememberToken = v4();
    const result = await User.create({
      firstName,
      lastName,
      email,
      // password: await bcrypt.hash(password, 10),
      rememberToken: rememberToken,
    });

    emailVerification.add({
      to: email,
      subject: "Email Verification",
      html:`<div style="background-color: #F4F4F4; padding: 20px;">
      <h2 style="color: #333;">Verify your Email.</h2>
      <p style="color: #666;">Please tap the button below to verify you eamil:</p>
      <a href="http://${HOST}:${PORT}/user/verify?token=${rememberToken}&email=${email}" style="text-decoration: none;">
          <div style="background-color: #3498DB; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block;">
              Set Password
          </div>
      </a></div>`,
    // html: `<html><p>Click the following button to verify your email</p><button><a href="http://${HOST}:${PORT}/user/verify?token=${rememberToken}&email=${email}">Verify</a></button></html>`,
      type: "emailVerification",
    });

    sendApiResponse(res,result, "User Created Successfully", 200);
  } catch (error) {
    sendApiError(res, error, 500, "Custom error message");
  }
};

export const verifyEmail = async (req, res) => {
  const { token, email } = req.query;
  
  try {
    // Verify the token against the stored tokens in the database
    const user = await User.findOne({
      where: {
        rememberToken: token,
        email: email,
      },
    });

    if (!user) {
      sendApiError(res, "Invalid email or Token", 400);
    }

    await User.update(
      { rememberToken: null },
      { where: { email: user.email } }
    );

    // const redirectUrl = `http://${HOST}:${PORT}/setpassword?email=${email}`;
    // sendApiResponse(res, { message: "Email verified successfully. Now you are redirecting to set password page.", redirectUrl });
    
   
    // Assuming your frontend is hosted on the same origin
    const redirectUrl = `http://192.168.11.218:8080/#/CreatePassword?email=${email}`;
    
    // Send the redirect URL in the response
    return sendApiResponse(res, { message: "Email verified successfully. Now you are redirecting to set password page.",email:email, redirectUrl });

  } catch (error) {
    sendApiError(res, error, 500, "Internal server error");
  }
};

export const handleSetPassword = async (req, res) => {

  try {
    
    const { password, confirmPassword ,email} = req.body;
    console.log(password, confirmPassword,email);
    // Verify the token against the stored tokens in the database
    if(email){
      const user = await User.findOne({
        where: {
          email: email,
          rememberToken: null,
        },
      });
      if (!user) {
        return sendApiError(res,  "Invalid email or user not verified. Please check your email for the verification link.", 400);
      }
  
     
  
      // Update the user's verification status
      await User.update(
        { isVerified: true },
        { where: { email: user.email } }
      );
  
      if (password !== confirmPassword) {
        return sendApiError(res, "Password does not match", 400);
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Update the user's password
      await User.update(
        { password: hashedPassword },
        { where: { email: user.email } }
      );

    // Send a success response
    return sendApiResponse(res, { message: "Password set successfully. Your account is now verified. You can log in." });
    }
    else{
      return sendApiError(res, error, 400, "Email not found");

    }
  
  } catch (error) {
    // Send an error response
    return sendApiError(res, error, 500, "Internal Server Error");
  }
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Verify the token against the stored tokens in the database
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return sendApiError(res,"Email not found. Please enter email.", 400);
    }

  
    emailVerification.add({
      to: email,
      subject: "Email Verification",
      html:`<div style="background-color: #F4F4F4; padding: 20px;">
      <h2 style="color: #333;">Set your Account Password.</h2>
      <p style="color: #666;">Please tap the button below to set  your account password:</p>
      <a href="http://192.168.11.218:8080/#/CreatePassword?email=${email}" style="text-decoration: none;">
          <div style="background-color: #3498DB; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block;">
              Set Password
          </div>
      </a></div>`,
      // html: `<html><p>Click the following button to change the Password</p><button><a href="http://192.168.11.218:8080/#/CreatePassword?email=${email}">Verify</a></button></html>`,
      type: "emailVerification",
    });

    // Send a success response
    return sendApiResponse(res, { message: "Email has been sent successfully." });

  } catch (error) {
    // Send an error response
    return sendApiError(res, error, 500, "Internal Server error");
  }
};


export default { createUser, verifyEmail,handleSetPassword ,forgetPassword, getUser};
