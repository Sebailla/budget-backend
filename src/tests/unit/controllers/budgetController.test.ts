import { createRequest, createResponse } from 'node-mocks-http'
import { budgetsMock } from '../../mocks/budgets.mocks'
import { BudgetController } from '../../../controllers/Budget.controller'
import Budget from '../../../models/Budget.model';
import Expense from '../../../models/Expense.model';


jest.mock('../../../models/Budget.model', () => ({
    // Metodos a simular de tu modelo
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
}))

describe('Budget Controller - getAll', () => {

    beforeEach(() => {
        (Budget.findAll as jest.Mock).mockImplementation((options) => {
            const updateBudgets = budgetsMock.filter(budget => budget.userId === options.where.userId)
            return Promise.resolve(updateBudgets)
        })
    })


    it('should retrieve 2 budgets for user with ID 1', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 1 }
        })
        const res = createResponse()

        await BudgetController.getAll(req, res)

        const data = res._getJSONData()

        expect(data.data).toHaveLength(2)
        expect(res.statusCode).toBe(200)
        expect(res.statusCode).not.toBe(404)

    })

    /* beforeEach(() => {
        (Budget.findAll as jest.Mock).mockRejectedValue(new Error)
    })

    it('should handle errors when fetching budgets', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 100 }
        })
        const res = createResponse()

        await BudgetController.getAll(req, res)

        expect(res.statusCode).toBe(500) 
    })*/
})

describe('Budget Controller.create', () => {
    it('should create a new budget', async () => {

        const mockBudget = {
            save: jest.fn().mockResolvedValue(true),
        };

        (Budget.create as jest.Mock).mockResolvedValue(mockBudget)


        const req = createRequest({
            method: 'POST',
            url: '/api/budgets',
            user: { id: 1 },
            body: {
                name: 'Test Budget',
                amount: 1000
            }
        })
        const res = createResponse()

        await BudgetController.create(req, res)

        const data = res._getJSONData()

        expect(data.message).toBe('Budget created successfully')
        expect(res.statusCode).toBe(201)
        expect(res.statusCode).not.toBe(404)
        //si se ejecuto en comando save
        expect(mockBudget.save).toHaveBeenCalled()
        //Que solamente se ejecute una vez para evita duplicados
        expect(mockBudget.save).toHaveBeenCalledTimes(1)
    })

    it('should handle budget creation error', async () => {

        const mockBudget = {
            save: jest.fn()
        };

        (Budget.create as jest.Mock).mockRejectedValue(new Error)

        const req = createRequest({
            method: 'POST',
            url: '/api/budgets',
            user: { id: 1 },
            body: {
                name: 'Test Budget',
                amount: 1000
            }
        })
        const res = createResponse()

        await BudgetController.create(req, res)

        const data = res._getJSONData()

        expect(data.message).toBe('Something went wrong')
        expect(res.statusCode).toBe(500)
        //NO se ejecuto en comando save
        expect(mockBudget.save).not.toHaveBeenCalled()

    })
})

describe('Budget Controller.getById', () => {

    beforeEach(() => {
        (Budget.findByPk as jest.Mock).mockImplementation((id) => {
            const budget = budgetsMock.filter(b => b.id === id)[0]
            return Promise.resolve(budget)
        })
    })

    it('should retrieve a budget by ID', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:id',
            budget: { id: 1 }
        })
        const res = createResponse()

        await BudgetController.getById(req, res)

        const { data } = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(res.statusCode).not.toBe(404)
        expect(data.expenses).toHaveLength(3)
        expect(data.name).toBe('Graduación')
        expect(Budget.findByPk).toHaveBeenCalled()
        expect(Budget.findByPk).toHaveBeenCalledTimes(1)
        expect(Budget.findByPk).toHaveBeenCalledWith(req.budget.id, {
            include: [Expense]
        })

    })

    it('should handle budget creation error', async () => {

        (Budget.findByPk as jest.Mock).mockRejectedValue(new Error)

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:id',
            budget: { id: 1 }
        })
        const res = createResponse()

        await BudgetController.create(req, res)

        const data = res._getJSONData()

        expect(data.message).toBe('Something went wrong')
        expect(res.statusCode).toBe(500)

    })
})

describe('Budget Controller.update', () => {
    it('should update a budget', async () => {
        const mockBudget = {
            update: jest.fn().mockResolvedValue(true)
        }

        const req = createRequest({
            method: 'PUT',
            url: '/api/budgets/:id',
            budget: mockBudget,
            body: {
                name: 'Test update Budget',
                amount: 1000
            }

        })
        const res = createResponse()

        await BudgetController.update(req, res)

        const data = res._getJSONData()

        expect(data.message).toBe('Budget updated successfully')

        expect(res.statusCode).toBe(200)
        expect(res.statusCode).not.toBe(404)
        expect(mockBudget.update).toHaveBeenCalled()
        expect(mockBudget.update).toHaveBeenCalledTimes(1)
        expect(mockBudget.update).toHaveBeenCalledWith(req.body)

    })

})

describe('Budget Controller.delete', () => {
    it('should delete a budget', async () => {
        const mockBudget = {
            destroy: jest.fn().mockResolvedValue(true)
        }

        const req = createRequest({
            method: 'DELETE',
            url: '/api/budgets/:id',
            budget: mockBudget,
        })
        const res = createResponse()

        await BudgetController.delete(req, res)

        const data = res._getJSONData()

        expect(data.message).toBe('Budget deleted successfully')

        expect(res.statusCode).toBe(200)
        expect(res.statusCode).not.toBe(404)
        expect(mockBudget.destroy).toHaveBeenCalled()
        expect(mockBudget.destroy).toHaveBeenCalledTimes(1)
    })

})