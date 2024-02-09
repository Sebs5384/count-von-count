import { Sequelize, Model } from "sequelize";
import { sequelize } from "../../database.js";

class UserGuild extends Model {}

UserGuild.init({
    user_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    guild_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    }
},
{
    sequelize
});

export default UserGuild;