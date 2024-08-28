import { Sequelize, Model } from "sequelize";
import { sequelize } from "../../database.js";

class Race extends Model {};

Race.init({
    race_time: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
},
    {
        sequelize
    }
);

export default Race;