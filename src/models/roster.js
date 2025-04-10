import { Sequelize, Model } from "sequelize";
import { sequelize } from "../../database.js";

class Roster extends Model {}

Roster.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    roster_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    member_amount: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    roster_date: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    thumbnail: {
        type: Sequelize.STRING,
        allowNull: true
    },
    roster_note: {
        type: Sequelize.STRING,
        allowNull: true
    },
    organized_by: {
        type: Sequelize.STRING,
        allowNull: false
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    channel_id: {
        type: Sequelize.STRING,
        allowNull: false
    }
},
    {
        sequelize,
    }
);

export default Roster;