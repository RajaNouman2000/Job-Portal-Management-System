import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize("jobportal", "root", "root", {
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
