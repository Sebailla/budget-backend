import type { Request, Response } from 'express'
import Budget from '../models/Budget.model'
import Expense from '../models/Expense.model'

export class BudgetController {

    static getAll = async (req: Request, res: Response) => {
        try {
            const budgets = await Budget.findAll({
                order: [['createdAt', 'DESC']],
                //limit: 5,
                where: {
                    userId: req.user.id
                }
            })

            res.json({ status: "success", data: budgets })

        } catch (error) {
            res.status(500).json({ status: "error", message: 'Something went wrong' })
        }
    }

    static create = async (req: Request, res: Response) => {

        try {
            const budget = await Budget.create(req.body)
            budget.userId = req.user.id
            await budget.save()

            res.status(201).json({ status: "success", message: 'Budget created successfully' })

        } catch (error) {
            res.status(500).json({ status: "error", message: 'Something went wrong' })
        }
    }

    static getById = async (req: Request, res: Response) => {

        const budget = await Budget.findByPk(req.budget.id, {
            include: [Expense]
        })

        res.json({ status: "success", data: budget })

    }

    static update = async (req: Request, res: Response) => {

        await req.budget.update(req.body)

        res.json({ status: "success", message: 'Budget updated successfully' })
    }

    static delete = async (req: Request, res: Response) => {

        await req.budget.destroy()

        res.json({ status: "success", message: 'Budget deleted successfully' })
    }
}