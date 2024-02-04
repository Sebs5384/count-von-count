import { Sequelize, Model } from "sequelize";
import { sequelize } from "../database.js";

class Boss extends Model {};

Boss.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    boss_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    boss_downtime: {
        type: Sequelize.STRING,
        allowNull: false
    }, 
    boss_spawn_window: {
        type: Sequelize.STRING,
        allowNull: false
    },
    boss_map: {
        type: Sequelize.STRING,
        allowNull: false
    },
    boss_emoji: {
        type: Sequelize.STRING,
        allowNull: true
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false
    }
},
    {
        sequelize,
    }
);

export default Boss;