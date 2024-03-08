import { Sequelize, Model } from "sequelize";
import { sequelize } from "../../database";

class BossAlias extends Model {};

BossAlias.init({
    boss_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
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
