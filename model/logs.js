import pkg from 'sequelize';
import Joi from 'joi';
const { DataTypes, Sequelize } = pkg;
import {sequelize} from "./config.js";

export const LogModel = sequelize.define('log', {
    userName:{type:DataTypes.STRING},
    email:{type:DataTypes.STRING},
    userAgent: DataTypes.STRING,
    method: DataTypes.STRING,
    reqBody: DataTypes.JSON,
    resBody: DataTypes.JSON,
    endpoint: DataTypes.STRING,
    statusCode: DataTypes.INTEGER,
    timestamp: { type: DataTypes.DATE, defaultValue: Sequelize.fn('now') },
  });

  export default {LogModel}