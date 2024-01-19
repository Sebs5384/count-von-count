import { Sequelize } from "sequelize";

const sequelize = new Sequelize('database', 'user', 'password', {
    dialect: 'sqlite',
    host: 'localhost',
    storage: './data/database.sqlite',
    logging: false
})

const queryInterface = sequelize.getQueryInterface();

export { sequelize, queryInterface }