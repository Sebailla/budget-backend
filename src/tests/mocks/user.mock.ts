import { Sequelize } from 'sequelize-typescript';

export const dbUser = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    models: [], // Array vacío para evitar cargar modelos reales
    logging: false,
    validateOnly: true
});