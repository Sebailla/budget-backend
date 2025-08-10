import { createRequest, createResponse } from 'node-mocks-http'
import Expense from '../../../models/Expense.model';
import { expenses } from '../../mocks/expenses';
import { hasAccess, validateExistExpense } from '../../../middlewares';
import { budgetsMock } from '../../mocks/budgets.mocks';
import Budget from '../../../models/Budget.model';

jest.mock('../../../models/Expense.model', () => ({
    findByPk: jest.fn(),
}))


describe('Expense Middleware - validateExistExpense', () => {

    beforeEach(() => {
        (Expense.findByPk as jest.Mock).mockImplementation((id) => {
            const expense = expenses.filter(e => e.id === id)[0] ?? null
            return Promise.resolve(expense)
        })
    })


    it('should handle non existen expense', async () => {

        const req = createRequest({
            params: {
                expenseId: 120
            }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateExistExpense(req, res, next)

        const data = res._getJSONData()

        expect(data.message).toBe('Expense not found')
        expect(res.statusCode).toBe(404)
        expect(next).not.toHaveBeenCalled()
        expect(req.expense).toBeUndefined()

    })

    it('should handle exist expense', async () => {

        //(Expense.findByPk as jest.Mock).mockResolvedValue(expenses[0])

        const req = createRequest({
            params: {
                expenseId: 1
            }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateExistExpense(req, res, next)

        expect(res.statusCode).not.toBe(404)
        expect(req.expense).toEqual(expenses[0])
        expect(next).toHaveBeenCalled()
    
    })

    it('should handle internal server error', async () => {

        (Expense.findByPk as jest.Mock).mockRejectedValue(new Error)

        const req = createRequest({
            params: {
                expenseId: 1
            }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateExistExpense(req, res, next)

        expect(res.statusCode).toBe(500)
        expect(res._getJSONData().message).toBe('Something went wrong')
        expect(next).not.toHaveBeenCalled()
        expect(req.expense).toBeUndefined()
    
    })

    it('should prevent inauthorized user from adding expenses', () => {

        const req = createRequest({
            method: 'POST',
            url: 'api/budgets/:budgetId/expenses',
            budget: budgetsMock[0],
            user: { id: 20 },
            body: {
                name: 'Expenses test',
                amount: 3000,
            }
        })
        const res = createResponse()
        const next = jest.fn()

        hasAccess(req, res, next)

        expect(next).not.toHaveBeenCalled()
        expect(res.statusCode).toBe(401)
        expect(res._getJSONData().message).toBe('Invalid Action')
    })

})

