import 'dotenv/config'
import { Sequelize } from 'sequelize-typescript'

export const db = new Sequelize(process.env.DATABASE_URL, {
    models:[__dirname + '/../models/**/*'],
    // Eliminamos los timestamps
    /* define:{
        timestamps: false
    }, */
    dialectOptions:{
        ssl: {
            require: false,
        }
    },
    //Eliminar informacion de consola
    logging: false

})