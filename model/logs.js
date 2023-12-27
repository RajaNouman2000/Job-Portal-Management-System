import pkg from 'sequelize';
import Joi from 'joi';
const { DataTypes, Sequelize } = pkg;
import {sequelize} from "./config.js";

export const LogModel = sequelize.define('log', {
    userName:DataTypes.STRING,
    email:DataTypes.STRING,
    userAgent: DataTypes.STRING,
    method: DataTypes.STRING,
    reqBody: DataTypes.JSON,
    endpoint: DataTypes.STRING,
    statusCode: DataTypes.INTEGER
  });

  export default {LogModel}