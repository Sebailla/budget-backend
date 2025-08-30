import { Request, Response } from 'express'
import 'dotenv/config'
import User from '../models/User.model'
import { comparePassword, generateJWT, generateToken, hashPassword } from '../utils'
import { AuthEmail } from '../emails/AuthEmail'


export class AuthController {

    static register = async (req: Request, res: Response) => {

        try {

            const existeUser = await User.findOne({
                where: {
                    email: req.body.email
                }
            })

            if (existeUser) {
                const error = new Error('User already exists')
                return res.status(409).json({ status: "error", message: error.message })
            }

            const newUser = await User.create(req.body)
            newUser.password = await hashPassword(newUser.password)
            newUser.token = generateToken()

            //Token para test
            if (process.env.NODE_ENV !== 'production') {
                globalThis.budgetConfirmationToken = newUser.token
            }

            await newUser.save()

            await AuthEmail.sendConfirmationEmail({
                name: newUser.name,
                email: newUser.email,
                token: newUser.token
            })

            res.status(201).json({ status: "success", message: 'User created successfully' })

        } catch (error) {
            console.log(error)
            res.status(500).json({ status: "error", message: 'Something went wrong' })
        }


    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const user = await User.findOne({
                where: {
                    token
                }
            })
            if (!user) {
                const error = new Error('Invalid token')
                return res.status(401).json({ status: "error", message: error.message })
            }

            user.confirmed = true
            user.isActive = true
            user.token = null
            await user.save()

            res.json({ status: "success", message: 'Account confirmed successfully' })

        } catch (error) {
            res.status(500).json({ status: "error", message: 'Something went wrong' })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {

            const user = await User.findOne({
                where: {
                    email: req.body.email
                }
            })

            if (!user) {
                const error = new Error('User not found')
                return res.status(404).json({ status: "error", message: error.message })
            }

            if (!user.confirmed) {
                const error = new Error('Unconfirmed account')
                return res.status(403).json({ status: "error", message: error.message })
            }

            const existPassword = await comparePassword(req.body.password, user.password)

            if (!existPassword) {
                const error = new Error('Invalid password')
                return res.status(401).json({ status: "error", message: error.message })
            }

            const token = generateJWT(user.id)

            res.json({ status: "success", message: 'Login successfully', token: token })

        } catch (error) {
            res.status(500).json({ status: "error", message: 'Something went wrong' })
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {

            const user = await User.findOne({
                where: {
                    email: req.body.email
                }
            })

            if (!user) {
                const error = new Error('User not found')
                return res.status(404).json({ status: "error", message: error.message })
            }

            user.token = generateToken()
            await user.save()

            await AuthEmail.sendForgotPasswordEmail({
                name: user.name,
                email: user.email,
                token: user.token
            })

            res.json({ status: "success", message: 'Email sent successfully' })


        } catch (error) {
            res.status(500).json({ status: "error", message: 'Something went wrong' })
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {

            const existsToken = await User.findOne({
                where: {
                    token: req.body.token
                }
            })

            if (!existsToken) {
                const error = new Error('Invalid token')
                return res.status(401).json({ status: "error", message: error.message })
            }

            res.json({ status: "success", message: 'Token is valid. Assign a new password' })

        } catch (error) {
            res.status(500).json({ status: "error", message: 'Something went wrong' })
        }
    }

    static resetPasswordWithToken = async (req: Request, res: Response) => {
        try {

            const user = await User.findOne({
                where: {
                    token: req.params.token
                }
            })

            if (!user) {
                const error = new Error('Invalid token')
                return res.status(401).json({ status: "error", message: error.message })
            }

            user.password = await hashPassword(req.body.password)
            user.token = null
            await user.save()

            res.json({ status: "success", message: 'Reset password successfully' })

        } catch (error) {
            res.status(500).json({ status: "error", message: 'Something went wrong' })
        }
    }

    static getUser = async (req: Request, res: Response) => {

        res.json({ status: "success", user: req.user })

    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {

        const { current_password, new_password } = req.body
        const { id } = req.user

        try {

            const user = await User.findOne(id)

            const password = await comparePassword(current_password, user.password)

            if (!password) {
                const error = new Error('Invalid Current Password')
                return res.status(401).json({ status: "error", message: error.message })
            }

            user.password = await hashPassword(new_password)
            await user.save()

            res.json({ status: "success", message: 'Password updated successfully' })


        } catch (error) {
            res.status(500).json({ status: "error", message: 'Something went wrong' })
        }
    }

    static checkPassword = async (req: Request, res: Response) => {

        const { password } = req.body

        try {

            const user = await User.findByPk(req.user.id)

            const validPassword = await comparePassword(password, user.password)

            if (!validPassword) {
                const error = new Error('Invalid Password')
                return res.status(401).json({ status: "error", message: error.message })
            }

            res.json({ status: "success", message: 'Password updated successfully' })


        } catch (error) {
            res.status(500).json({ status: "error", message: 'Something went wrong' })
        }
    }

}

