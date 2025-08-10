import type { Request, Response } from 'express'
import Expense from '../models/Expense.model'


export class ExpenseController {

    static getAll = async (req: Request, res: Response) => {
        try {
            const expenses = await Expense.findAll({
                order: [['createdAt', 'DESC']],
                // todo filtrar por user
                //limit: 5,
                where: {
                    budgetId: req.budget.id
                }
            })

            res.json({ status: "success", data: expenses })

        } catch (error) {
            res.status(500).json({ status: "error", message: 'Something went wrong' })
        }
    }

    static create = async (req: Request, res: Response) => {
        try {
            const expense = await Expense.create(req.body)
            expense.budgetId = req.budget.id
            await expense.save()

            res.status(201).json({ status: "success", message: 'Expense created successfully' })

        } catch (error) {
            res.status(500).json({ status: "error", message: 'Something went wrong' })
        }
    }

    static getById = async (req: Request, res: Response) => {
        res.json({ status: "success", data: req.expense })
    }

    static updateById = async (req: Request, res: Response) => {
        await req.expense.update(req.body)

        res.json({ status: "success", message: 'Expense updated successfully' })
    }

    static deleteById = async (req: Request, res: Response) => {
        await req.expense.destroy()

        res.json({ status: "success", message: 'Expense deleted successfully' })
    }
}