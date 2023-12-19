import pkg from 'sequelize';
import Joi from 'joi';
const { DataTypes, Sequelize } = pkg;
import {sequelize} from "./config.js";


export const Job = sequelize.define(
    "job", 
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
        min: 0,
      },
      cnic: {
        type: DataTypes.STRING,
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
      },
      cv: {
        type: DataTypes.STRING,
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
      userName: Joi.string().min(5).max(30).required(),
      email: Joi.string().required().email(),
      age: Joi.number().integer().min(0),
      cnic: Joi.string(),
      qualification: Joi.string().allow(''),
      address: Joi.string().min(1).max(30).required(),
      phoneNumber: Joi.string(),
      cv:Joi.string(),
      status: Joi.string().valid('pending', 'accepted', 'rejected'),
    });
  
    return schema.validate(job);
  }

export default {Job,validateJob};