import { Sequelize, Model } from "sequelize";
import { sequelize } from "../../database.js";

class BossAlias extends Model {};

BossAlias.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    boss_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    boss_alias: {
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

export default BossAlias;
