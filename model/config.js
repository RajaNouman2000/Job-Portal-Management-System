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

// Sync the model with the database
sequelize
  .sync()
  .then(() => {
    console.log("Database and tables are in sync");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });


export default {sequelize};
