import pkg from 'sequelize';
const { DataTypes } = pkg;
import { sequelize } from "./config.js";
import { User } from './user.js';

export const ChatData = sequelize.define('chats', {
    user_id: {
        type: DataTypes.INTEGER, // Use INTEGER for auto-incrementing primary key in MySQL
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

// Add the association in your User model
User.hasMany(ChatData, { foreignKey: 'user_id', as: 'chats' });

// Add the association in your ChatData model
ChatData.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default {ChatData};
