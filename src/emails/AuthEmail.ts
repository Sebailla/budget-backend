//import { transport } from "../config"
import { transporter } from "../config/email"
import 'dotenv/config'
import { EmailType } from "../types"



export class AuthEmail{
    static sendConfirmationEmail = async (user: EmailType) => {
        
        const email = await transporter.sendMail({
            from: `Budget <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Confirm your email',
            html: `
                <p>Hola: <b>${user.name}</b>, has creado tu cuenta en Budget</p>
                <p>Visita el siguiente enlace:</p>
                <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar Cuenta</a>
                <p>Tu Codigo de Confirmacion es: <b>${user.token}</b></p>
            `
        })
        
    }

    static sendForgotPasswordEmail = async (user: EmailType) => {
        
        const email = await transporter.sendMail({
            from: `Budget <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Reset Password',
            html: `
                <p>Hola: <b>${user.name}</b>, has solicitado restablecer tu Password de tu cuenta en Budget</p>
                <p>Visita el siguiente enlace:</p>
                <a href="${process.env.FRONTEND_URL}/auth/reset-password">Restablecer Password</a>
                <p>Tu Codigo de Confirmacion es: <b>${user.token}</b></p>
            `
        })
        
    }
}