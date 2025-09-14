import { Router } from "express"
import { AuthController } from "../controllers/Auth.controller"
import { body, param } from "express-validator"
import { authenticateUser, handleInputErrors } from "../middlewares"
import { limiter } from "../config"


const router = Router()

//? Params

//router.use(limiter)

//? --------------------------------
//! Route for Auth

router.post('/login',
    limiter,
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email'),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleInputErrors,
    AuthController.login)

router.post('/register',
    body('name')
        .notEmpty().withMessage('Name is required'),
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    handleInputErrors,
    AuthController.register)

router.post('/confirm-account',
    limiter,
    body('token')
        .isLength({ min: 6, max: 6 }).withMessage('Invalid token'),
    handleInputErrors,
    AuthController.confirmAccount)

router.post('/forgot-password',
    limiter,
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email'),
    handleInputErrors,
    AuthController.forgotPassword)

router.post('/validate-token',
    limiter,
    body('token')
        .notEmpty().withMessage('Invalid token')
        .isLength({ min: 6, max: 6 }).withMessage('Invalid token'),
    handleInputErrors,
    AuthController.validateToken)

router.post('/reset-password/:token',
    param('token')
        .notEmpty().withMessage('Invalid token')
        .isLength({ min: 6, max: 6 }).withMessage('Invalid token'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    handleInputErrors,
    AuthController.resetPasswordWithToken)

router.post('/update-password',
    authenticateUser,
    body('current_password')
        .notEmpty().withMessage('Current Password is required'),
    body('new_password')
        .notEmpty().withMessage('New Password is required')
        .isLength({ min: 8 }).withMessage('New Password must be at least 8 characters'),
    handleInputErrors,
    AuthController.updateCurrentUserPassword)

router.post('/check-password',
    authenticateUser,
    body('password')
        .notEmpty().withMessage('Current Password is required'),
    handleInputErrors,
    AuthController.checkPassword)

router.get('/user',
    authenticateUser,
    AuthController.getUser)

router.put('/user',
    authenticateUser,
    body('name')
        .notEmpty().withMessage('Name is required'),
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email'),
    handleInputErrors,
    AuthController.updateUser)

//? --------------------------------


export default router