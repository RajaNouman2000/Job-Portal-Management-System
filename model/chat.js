import pkg from 'sequelize';
const { DataTypes } = pkg;
import { sequelize } from "./config.js";

export const ChatData = sequelize.define('chattable', {
    userName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    question: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    response: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

export default {ChatData};
