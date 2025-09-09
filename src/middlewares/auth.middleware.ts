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
        return res.status(401).json({ status: "error", message: 'Unauthorized User' });
    }

    const token = bearer.split(' ')[1];
    if (!token) {
        return res.status(401).json({ status: "error", message: 'Invalid Token' });
    }

    try {
        const decoder = verifyJWT(token);
        if (typeof decoder === 'object' && decoder.id) {
            req.user = await User.findByPk(decoder.id, {
                attributes: ['id', 'name', 'email']
            });

            if (!req.user) {
                return res.status(401).json({ status: "error", message: 'User not found' });
            }

            next();
        } else {
            return res.status(401).json({ status: "error", message: 'Invalid Token' });
        }

    } catch (error) {
        return res.status(401).json({ status: "error", message: 'Token expired or invalid' });
    }
}


