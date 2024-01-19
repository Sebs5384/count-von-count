import { Sequelize, Model } from "sequelize";
import { sequelize } from "../database.js";

class BirthdayChannel extends Model {}

BirthdayChannel.init({
    birthday_channel: {
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
    },
},
{
    sequelize,
}
);

export default BirthdayChannel;