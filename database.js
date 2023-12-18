import { Sequelize } from "sequelize";

const sequelize = new Sequelize('database', 'user', 'password', {
    dialect: 'sqlite',
    host: 'localhost',
    storage: './data/database.sqlite',
    logging: false
})

export default sequelize;