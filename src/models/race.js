import { Sequelize, Model } from "sequelize";
import { sequelize } from "../../database.js";

class Race extends Model {};

Race.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
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