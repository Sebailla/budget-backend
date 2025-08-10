import { createRequest, createResponse } from 'node-mocks-http'
import Expense from '../../../models/Expense.model';
import { ExpenseController } from '../../../controllers/Expense.controller';
import { expenses } from '../../mocks/expenses';

jest.mock('../../../models/Expense.model', () => ({
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
}))

describe('ExpenseController - create', () => {
    it('Should create a new expense', async () => {

        const expenseMock = {
            save: jest.fn().mockResolvedValue(true),
        };

        (Expense.create as jest.Mock).mockResolvedValue(expenseMock)

        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            budget: { id: 1 },
            body: {
                name: 'Test Expenses',
                amount: 222
            }
        })
        const res = createResponse()

        await ExpenseController.create(req, res)

        const data = res._getJSONData()

        expect(data.message).toBe('Expense created successfully')
        expect(res.statusCode).toBe(201)
        expect(res.statusCode).not.toBe(404)
        expect(expenseMock.save).toHaveBeenCalled()
        expect(expenseMock.save).toHaveBeenCalledTimes(1)

    })

    it('Should handle expenses create error', async () => {

        const expenseMock = {
            save: jest.fn().mockResolvedValue(true),
        };

        (Expense.create as jest.Mock).mockRejectedValue(new Error)

        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            budget: { id: 1 },
            body: {
                name: 'Test Expenses',
                amount: 222
            }
        })
        const res = createResponse()

        await ExpenseController.create(req, res)

        const data = res._getJSONData()

        expect(data.message).toBe('Something went wrong')
        expect(res.statusCode).toBe(500)
        expect(expenseMock.save).not.toHaveBeenCalled()

    })
})

describe('ExpenseController - getById', () => {
    it('Should return expense with id 1', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            expense: expenses[0]
        })
        const res = createResponse()

        await ExpenseController.getById(req, res)

        const data = res._getJSONData()
        expect(data.data).toEqual(expenses[0])
        expect(res.statusCode).toBe(200)
        expect(res.statusCode).not.toBe(404)

    })
})

describe('ExpenseController - updateById', () => {
    it('Should update expenses and return a success message', async () => {

        const expenseMock = {
            update: jest.fn().mockResolvedValue(true)
        };

        const req = createRequest({
            method: 'PUT',
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            expense: expenseMock,
            body: {
                name: 'Update Expenses',
                amount: 100
            }
        })
        const res = createResponse()

        await ExpenseController.updateById(req, res)

        const data = res._getJSONData()

        expect(data.message).toBe('Expense updated successfully')
        expect(res.statusCode).toBe(200)
        expect(res.statusCode).not.toBe(404)
        expect(expenseMock.update).toHaveBeenCalled()
        expect(expenseMock.update).toHaveBeenCalledTimes(1)
        expect(expenseMock.update).toHaveBeenCalledWith(req.body)

    })
})

describe('ExpenseController - deleteById', () => {
    it('Should delete expenses and return a success message', async () => {

        const expenseMock = {
            destroy: jest.fn().mockResolvedValue(true)
        };

        const req = createRequest({
            method: 'DELETE',
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            expense: expenseMock,

            
        })
        const res = createResponse()

        await ExpenseController.deleteById(req, res)

        const data = res._getJSONData()

        expect(data.message).toBe('Expense deleted successfully')
        expect(res.statusCode).toBe(200)
        expect(res.statusCode).not.toBe(404)
        expect(expenseMock.destroy).toHaveBeenCalled()
        expect(expenseMock.destroy).toHaveBeenCalledTimes(1)

    })
})