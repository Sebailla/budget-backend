import express from 'express'
import colors from 'colors'
import morgan from 'morgan'
import { db } from './config'
import budgetRouter from './router/budget.router'
import authRouter from './router/auth.router'

async function connectDB() {

    try {
        await db.authenticate()
        db.sync()
        console.log(colors.black.bold.bgGreen(' DataBase connection OK... '))
    } catch (error) {
        console.log(colors.white.bold.bgRed(` Error connecting to the database: ${error} `))
        process.exit(1)
    }
}

connectDB()

const app = express()

app.use(morgan('dev'))

app.use(express.json())

//app.use(limiter)

app.use('/api/budgets', budgetRouter)
app.use('/api/auth', authRouter)

export default app