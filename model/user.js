import pkg from 'sequelize';
import Joi from 'joi';
const { DataTypes, Sequelize } = pkg;
import {sequelize} from "./config.js";


export const User = sequelize.define(
  "user",
  {
    firstName:  {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName:  {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique:true,
      allowNull: false,
    },
    password:  {
      type: DataTypes.TEXT,     
    },
    rememberToken: {
      type: DataTypes.STRING,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue:false
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue:false,
    },
    verificationTokenCreated:{
      type:DataTypes.DATE,
    }

  },
);


export function validateUser(user){
  const schema =Joi.object({
      firstName: Joi.string().min(3).max(30).required(),
      lastName: Joi.string().min(3).max(30).required(),
      email: Joi.string().required().email(),
      password: Joi.string().min(8).max(30),
      isAdmin: Joi.boolean(), 
    isVerified: Joi.boolean(),
  });
  return schema.validate(user);
  }

export default {User,validateUser};