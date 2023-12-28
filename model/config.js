import { Sequelize } from 'sequelize';
import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();

const DATABASENAME= process.env.DATABASENAME; 
const USER= process.env.DATABASEUSER; 
const PASSWORD= process.env.PASSWORD; 

export const sequelize = new Sequelize(DATABASENAME, USER,PASSWORD, {
  host: "localhost",
  dialect: "mysql",
  logging:false
});

export default {sequelize};
