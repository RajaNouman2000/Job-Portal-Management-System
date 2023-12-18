import { v4 } from 'uuid';
import fs from "fs";
import Joi from 'joi';
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Job, validateJob } from "../model/job.js";
import {
  sendApiError,
  sendApiResponse,
} from "../helper_function/response-api.js";

export const createJob = async (req, res) => {
  try {
    const file = req.files['cv'];
    if (!file || file.length === 0) {
        // 'cv' file is not present, handle this case (e.g., send an error response)
        sendApiError(res, "CV file is missing", 400);
        return;
      }
      
      const pdfPath = `cvs/${req.body.email}.pdf`;
      
      try {
        fs.writeFileSync(pdfPath, file[0].buffer);
      } catch (error) {
        // Handle the error (e.g., send an error response)
        sendApiError(res, "Error saving CV file", 500, error.message);
        return;
      }
    const {
      userName,
      email,
      age,
      cnic,
      qualification,
      address,
      phoneNumber,
      status,
    } = req.body;

    // Validate user input
    const { error } = validateJob({
      userName,
      email,
      age,
      cnic,
      qualification,
      address,
      phoneNumber,
      cv:pdfPath,
      status,
    });
    if (error) {
      sendApiError(res, error.details[0].message, 400);
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
        cv:pdfPath,
        status,
    });

    sendApiResponse(res, result, "Job Created Successfully", 200);
  } catch (error) {
    sendApiError(res, error, 500, "Custom error message");
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
      sendApiError(res, error.details[0].message, 400);
      return;
    }

    const { email, status } = req.body;

    // Check if the email exists in the database
    const existingJob = await Job.findOne({
      where: { email: email },
    });

    if (!existingJob) {
      sendApiError(res, "Job not found for the provided email", 404);
      return;
    }

    // Update the job status
    const result = await Job.update(
      { status: status },
      { where: { email: email } }
    );

    sendApiResponse(res, result, "Job updated successfully", 200);
  } catch (error) {
    sendApiError(res, error, 500, "Custom error message");
  }
};

export default {createJob,updateJobStatus}