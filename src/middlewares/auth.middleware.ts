import { Request, Response, NextFunction } from 'express'
import { verifyJWT } from '../utils'
import User from '../models/User.model'


declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {

    const bearer = req.headers.authorization
    if (!bearer) {
        const error = new Error('Unauthorized User')
        return res.status(401).json({ status: "error", message: error.message })
    }

    const token = bearer.split(' ')[1]

    if (!token) {
        const error = new Error('Invalid Token')
        return res.status(401).json({ status: "error", message: error.message })
    }

    try {
        const decoder = verifyJWT(token)
        if (typeof decoder === 'object' && decoder.id) {
            req.user = await User.findByPk(decoder.id, {
                attributes: ['id', 'name', 'email']
            })
            next()
        }

    } catch (error) {
        res.status(500).json({ status: "error", message: 'Invalid Token' })
    }
}


