import { Sequelize, Model } from "sequelize";
import { sequelize } from "../database.js";

class TrackerChannel extends Model {};

TrackerChannel.init({
    guild_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
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
},
    {
        sequelize,
    }
);

export default TrackerChannel;