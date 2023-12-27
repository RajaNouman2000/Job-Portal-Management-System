import pkg from 'sequelize';
import Joi from 'joi';
const { DataTypes, Sequelize } = pkg;
import {sequelize} from "./config.js";


export const Job = sequelize.define(
    "applicant", 
    {
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique:true,
        allowNull: false,
      },
      age: {
        type: DataTypes.INTEGER, 
        min: 18,
      },
      cnic: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      qualification: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cv: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending',
      },
    },
    {
        paranoid: true, // Enable soft delete
    }
  );

  
export function validateJob(job) {
    const schema = Joi.object({
      userName: Joi.string().min(3).max(30).required(),
      email: Joi.string().required().email().pattern(/^\d*[a-zA-Z][a-zA-Z0-9]*@/),
      age: Joi.number().integer().min(18).max(100),
      cnic: Joi.number().integer().min(1000000000000).max(9999999999999).required(),
      qualification: Joi.string().allow(''),
      address: Joi.string().min(5).max(50).required(),
      phoneNumber: Joi.string()
      .length(13)
      .pattern(/^[+-]\d+$/) // Allows only + or - at the beginning and then numeric characters
      .required(),
      cv: Joi.string().required(),
      status: Joi.string().valid('pending', 'accepted', 'rejected').default('pending'),
    });
  
    return schema.validate(job);
  }

export default {Job,validateJob};