import { Sequelize, Model } from "sequelize";
import { sequelize } from "../../database.js";

class Race extends Model {};

Race.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    next_race_time: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    race_settler_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    hours_till_race: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    minutes_till_race: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    last_settled_race_time: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    guild_id: {
        type: Sequelize.STRING, 
        allowNull: false
    }
},
    {
        sequelize
    }
);

export default Race;