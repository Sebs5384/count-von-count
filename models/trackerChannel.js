import { Sequelize, Model } from "sequelize";
import { sequelize } from "../database.js";

class TrackerChannel extends Model {};

TrackerChannel.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    perma_tracker_channel_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    tracker_channel_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    category_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    guild_category_id: {
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

export default TrackerChannel;