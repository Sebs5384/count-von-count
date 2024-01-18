import { Sequelize } from "sequelize";
import sequelize from "../database.js";

const Channels = sequelize.define('channel', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    channel_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    channel_name: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

export default Channels;