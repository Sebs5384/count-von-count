import { Sequelize, Model } from "sequelize";
import sequelize from "../database.js";

class Guild extends Model {}

Guild.init({
    guild_id: {
        type: Sequelize.STRING,
        primaryKey: true,
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
},
{
    sequelize,
}
);

export default Guild;