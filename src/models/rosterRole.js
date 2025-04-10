import { Sequelize, Model } from "sequelize";
import { sequelize } from "../../database.js";

class RosterRole extends Model {}

RosterRole.init({
    role_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    assigned_user: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    role_position: {
        type: Sequelize.STRING,
        allowNull: false
    },
    role_type: {
        type: Sequelize.ENUM('main', 'reserve'),
        allowNull: false,
        defaultValue: 'main'
    },
    roster_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
},
    {
        sequelize,
    }
);

export default RosterRole;