import { Sequelize, Model } from "sequelize";
import { sequelize } from "../../database.js";

class User extends Model {}

User.init({
    user_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    user_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    birthday_date: {
        type: Sequelize.DATE,
        allowNull: false
    }
},
{
    sequelize,
}
);

export default User;
