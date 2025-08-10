import jwt from 'jsonwebtoken'
import 'dotenv/config'

export const generateJWT = (id: string): string=>{
    
    const token = jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: '24h'
    })
    return token
}

export const verifyJWT = (token: string)=>{
    
    const result = jwt.verify(token, process.env.JWT_SECRET)
    return result
    
}

