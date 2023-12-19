import { LogModel } from "../model/logs.js";

export const logRequest = async (req, res, next) => {
    console.log("Logs middleware");
    console.log(req.user)
    try {
      const logData = {
        userAgent: req.headers['user-agent'],
        endpoint: req.url,
        method: req.method,
        userName: req.user ? req.user.userName : '',
        email: req.user ? req.user.email : '',
        reqBody: req.body,
      };
  
      let responseSent = false;
  
      res.on('finish', async () => {
        if (!responseSent) {
          logData.statusCode = res.statusCode;
          logData.resBody = res.body;
          await LogModel.create(logData)
            .then(() => {
              responseSent = true;
            })
            .catch((error) => {
              console.error('Error saving log entry to Sequelize:', error);
              next();
            });
        }
      });
  
      next();
    } catch (error) {
      console.error('Error in logRequest middleware:', error);
      next(error);
    }
  };
  

export default {logRequest}
