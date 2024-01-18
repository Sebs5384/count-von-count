import { Sequelize, Model } from "sequelize";
import sequelize from "../database.js";

class Channel extends Model {}

Channel.init({
    channel_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    channel_name: {
        type: Sequelize.STRING,
        allowNull: false
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

export default Channel;