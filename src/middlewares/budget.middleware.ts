import { Request, Response, NextFunction } from 'express'
import { body, param, validationResult } from 'express-validator'
import Budget from '../models/Budget.model'


declare global {
    namespace Express {
        interface Request {
            budget?: Budget
        }
    }
}

export const validateBudgetId = async (req: Request, res: Response, next: NextFunction) => {

    await param('budgetId')
        .isInt().withMessage('Invalid id').bail()
        .custom(value => value > 0).withMessage('Invalid id').bail()
        .run(req)

    let errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    next()
}


export const validateExistBudget = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { budgetId } = req.params
        const budget = await Budget.findByPk(budgetId)

        if (!budget) {
            const error = new Error('Budget not found')
            return res.status(404).json({ status: "error", message: error.message })
        }

        req.budget = budget

        next()

    } catch (error) {
        res.status(500).json({ status: "error", message: 'Something went wrong' })
    }

    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
}


export const validateBudgetData = async (req: Request, res: Response, next: NextFunction) => {

    await body('name')
        .notEmpty().withMessage('Name is required')
        .run(req)
    await body('amount')
        .notEmpty().withMessage('Amount is required')
        .isNumeric().withMessage('Amount must be a number')
        .custom(value => value > 0).withMessage('Amount must be greater than 0')
        .run(req)

    next()
}

export const hasAccess = (req: Request, res: Response, next: NextFunction) => {

    if (req.budget.userId !== req.user.id) {
        const error = new Error('Invalid Action')
        return res.status(401).json({ status: "error", message: error.message })
    }

    next()
}
