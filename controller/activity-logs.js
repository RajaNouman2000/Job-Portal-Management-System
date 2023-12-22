import pkg from 'sequelize';
import Joi from 'joi';
const { DataTypes, Sequelize ,Op} = pkg;

import { LogModel } from "../model/logs.js";
import {sendApiError,sendApiResponse} from "../helper_function/response-api.js" 

export const getActivityLogs = async (req, res) => {
  
  try {
      const { pageNumber = 1, perPage = 10, firstName, lastName, email, isAdmin, isVerified } = req.body;


      console.log(req.params)
      console.log(req.query)
      // Calculate the skip value based on the page number
      const skip = (pageNumber - 1) * perPage;

  
      // Fetch total count for pagination with applied filters
      const totalCount = await LogModel.count({
        where: {
          method: 'post', 
        },
      });
  
      // Fetch records from the database using the calculated skip and limit values and applied filters
      const users = await LogModel.findAll({
        attributes: ["id","userName", "email", "reqBody", "resBody", "createdAt", "statusCode"],
        where: {
            method: 'post', 
          },
        offset: skip,
        limit: perPage,
      });
  
      // Calculate total pages
      const totalPages = Math.ceil(totalCount / perPage);
  
     // Calculate next and previous page numbers
     const nextPage = pageNumber < totalPages ? parseInt(pageNumber) + 1 : null;
     const prevPage = pageNumber > 1 ? parseInt(pageNumber) - 1 : null;

     // Send the paginated list of users along with pagination details as a response
     sendApiResponse(res, { logid: req.logEntry.logId,  totalPages, perPage, pageNumber, nextPage, prevPage, users  }, "Paginated users fetched successfully", 200);

 } catch (error) {
     console.error("Error fetching paginated users:", error);
     sendApiError(res, error.message, {logid: req.logEntry.logId});
 }
};


export default {getActivityLogs}