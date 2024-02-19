import { Sequelize } from "sequelize";

const sequelize = new Sequelize('database', 'user', 'password', {
    dialect: 'sqlite',
    host: 'localhost',
    storage: './src/data/database.sqlite',
    logging: false
})

const queryInterface = sequelize.getQueryInterface();
const operator = Sequelize.Op

export { sequelize, queryInterface, operator }