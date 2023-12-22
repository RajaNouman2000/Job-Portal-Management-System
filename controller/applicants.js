import { v4 } from 'uuid';
import fs from "fs";
import Joi from 'joi';
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import job, { Job, validateJob } from "../model/applicant.js";
import pkg from 'sequelize';
const { DataTypes, Sequelize ,Op} = pkg;
import { rejected  } from "../mail_verification/mail-job.js";
import {sendApiError,sendApiResponse} from "../helper_function/response-api.js" 
import { query } from 'express';

export const createJob = async (req, res) => {
  try {
    const { userName, email, age, cnic, qualification, address, phoneNumber, status } = req.body;

    const file = req.files['cv'];
    if (!file || file.length === 0) {
      // 'cv' file is not present, handle this case (e.g., send an error response)
      sendApiError(res, "CV file is missing",req.logEntry.logId, 400);
      return;
    }

    const pdfPath = `cvs/${email}.pdf`;

    // Validate user input
    const { error } = validateJob({
      userName,
      email,
      age,
      cnic,
      qualification,
      address,
      phoneNumber,
      cv: pdfPath,
      status,
    });
    if (error) {
      sendApiError(res, error.details[0].message,req.logEntry.logId, 400);
      return;
    }

    // Check if a job application with the given email already exists
    const existingJob = await Job.findOne({ where: { email } });
    if (existingJob) {
      sendApiError(res, "A job application with this email already exists", req.logEntry.logId,409);
      return;
    }
    const result = await Job.create({
      userName,
      email,
      age,
      cnic,
      qualification,
      address,
      phoneNumber,
      cv: pdfPath,
      status,
    });
      
    
    try {
      fs.writeFileSync(pdfPath, file[0].buffer);
    } catch (error) {
      sendApiError(res, error.message,req.logEntry.logId);
      return;
    }


    sendApiResponse(res, req.logEntry.logId, "Job Created Successfully", 201);
  } catch (error) {
    return sendApiError(res, error.message,req.logEntry.logId);
  }
};

export const updateJobStatus = async (req, res) => {
  try {
    // Define the validation schema
    const schema = Joi.object({
      email: Joi.string().email().required(),
      status: Joi.string().valid('pending', 'accepted', 'rejected').required(),
    });

    // Validate the request body against the schema
    const { error } = schema.validate(req.body);

    if (error) {
      // Validation failed, send an error response
      sendApiError(res, error.details[0].message,  req.logEntry.logId,400);
      return;
    }

    const { email, status } = req.body;
    console.log(email,status)
    // Check if the email exists in the database
    const existingJob = await Job.findOne({
      where: { email: email },
    });

    if (!existingJob) {
      sendApiError(res, "Job not found for the provided email", req.logEntry.logId, 404);
      return;
    }

    // Update the job status
    const result = await Job.update(
      { status: status },
      { where: { email: email } }
    );
    // Your email template
const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
    }

    .header h2 {
      color: #333333;
    }

    .message {
      margin-bottom: 20px;
    }

    .btn {
      display: inline-block;
      padding: 10px 20px;
      text-decoration: none;
      background-color: #007BFF;
      color: #ffffff;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Job Application Status</h2>
    </div>
    <div class="message">
      <p>Your job application has been <strong>accepted</strong>!</p>
      <p>Dear Nouman,
      Thank you for your interest in Cogent Labs and for applying for the Python/Django Developer role.
      We appreciate the time and effort you invested in the application and interview process. 
      However, after careful evaluation, we have decided not to proceed with your application at 
      this time based on your performance during the interview process.
      We wish you the best in your future endeavors!
      
      
      Regards,
      
      HR Team
      
      Cogent Labs</p>
    </div>
    
  </div>
</body>
</html>

`;

rejected.add({
      to: email,
      subject: "Email Verification",
      html: emailHtml,
      type: "emailVerification",
    });

    sendApiResponse(res, req.logEntry.logId, "Job updated successfully");
  } catch (error) {
    return sendApiError(res, error.message, req.logEntry.logId);
  }
};

export const softdelete = async () => {
  try {
    // Find job applications with status 'rejected'
    const rejectedJobs = await Job.findAll({
      where: {
        status: 'rejected'
      }
    });

    // Remove CV files and destroy job applications
    for (const job of rejectedJobs) {
      const pdfPath = `/home/raja/Express/Project#1/cvs/${job.email}.pdf`;

      // Check if the CV file exists before attempting to delete
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    // Soft delete the job applications
    const result = await Job.destroy({
      where: {
        status: 'rejected'
      }
    });

    return "Soft Delete Done successfully";
  } catch (error) {
    return error;
  }
};

export const getJob = async (req, res) => {
  try {
    const { pageNumber = 1, perPage = 10, status, userName, email } = req.query;

    console.log(req.query)
    // Calculate the skip value based on the page number
    const skip = (pageNumber - 1) * perPage;

    // Build filter object based on provided query parameters
    const filter = {};
    if (status) {
      filter.status = { [Op.eq]: status };
    }
    if (userName) {
      filter.userName = { [Op.like]: `%${userName}%` };
    }
    if (email) {
      filter.email = { [Op.like]: `%${email}%` };
    }

    // Fetch total count for pagination with applied filters
    const totalCount = await Job.count({
      where: filter,
    });

    // Fetch records from the database using the calculated skip and limit values and applied filters
    const jobs = await Job.findAll({
      where: filter,
      attributes: ["id","userName","qualification","phoneNumber", "email", "age", "status"], // Add other attributes as needed
      offset: skip,
      limit: perPage,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / perPage);

    // Calculate next and previous page numbers
    const nextPage = pageNumber < totalPages ? parseInt(pageNumber) + 1 : null;
    const prevPage = pageNumber > 1 ? parseInt(pageNumber) - 1 : null;

    // Send the paginated list of jobs along with pagination details as a response
    sendApiResponse(res, {logid: req.logEntry.logId, totalPages, perPage, pageNumber, nextPage, prevPage, jobs } , "Jobs fetched successfully", 200);


  } catch (error) {
    return sendApiError(res, error.message,  req.logEntry.logId);

  }
};

export const downloadCv = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email)

    // Fetch records from the database using the provided email
    const user = await Job.findOne({
      where: {
        email: email,
      },
    });

    // Check if a user with the provided email exists
    if (!user) {
      sendApiError(res, "User not found with the provided email", req.logEntry.logId, 404);
      return;
    }

    // Read the CV file associated with the user's email
    const pdfPath = `/home/raja/Express/Project#1/cvs/${user.email}.pdf`;

    // Set the response headers for file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${user.email}_CV.pdf`);

    // Send the CV file as a response
    res.sendFile(pdfPath);
  } catch (error) {
    console.error("Error downloading CV:", error);
    return sendApiError(res, error.message,  req.logEntry.logId);
  }
};

export default {createJob,updateJobStatus,softdelete,getJob,downloadCv}