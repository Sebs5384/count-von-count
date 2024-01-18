import { Sequelize } from "sequelize";
import sequelize from "../database.js";

const Guilds = sequelize.define('guilds', {
    id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    guild_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    guild_master: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

export default Guilds;