import {db} from '../config/db'
import colors from 'colors'
import {exit} from 'node:process'

const clearData = async () => {

    try {
        await db.sync({force: true})
        
        console.log( colors.white.bold.bgRed(' Data Base Clear successfully '))
        
        exit(0)
    } catch (error) {
        //console.log(error)
        exit(1) 
        // finaliza ejecucion pero con errores / 0 - finaliza pero sin errores
    }

}

if(process.argv[2] === '--clear'){
    clearData()
}

