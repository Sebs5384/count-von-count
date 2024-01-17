import { Sequelize } from "sequelize";
import sequelize from "../database.js";
import Guilds from "./guilds.js";

const Channels = sequelize.define('channel', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    channel_id: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

Channels.belongsTo(Guilds, { foreignKey: 'guild_id' });

export default Channels;