import winston from 'winston'
import { fileURLToPath } from 'url';
import path from 'path';
import pkg from 'sequelize';
const { DataTypes, Sequelize } = pkg;

import { LogModel } from '../model/logs.js';

// Get the directory name using the import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Custom transport for Sequelize
class SequelizeTransport extends winston.Transport {
  constructor(options) {
    super(options);
    this.name = 'SequelizeTransport';
  }
  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    LogModel.create({
      // timestamp: info.timestamp,
      level: info.level,
      message: info.message,
      
    })
      .then(() => {
        callback(null, true);
      })
      .catch((error) => {
        console.error('Error saving log entry to Sequelize:', error);
        callback(error);
      });
  }
}
// Define the path for the log file
const logFilePath = path.join(__dirname, '..', 'api.log');
console.log(logFilePath)
// Create an instance of the custom Sequelize transport
const sequelizeTransport = new SequelizeTransport();
// Create the Winston logger with Console, File, and Sequelize transports
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: logFilePath }),
    sequelizeTransport,
  ],
});

export { logger,LogModel};