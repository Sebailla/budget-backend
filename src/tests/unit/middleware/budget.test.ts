import { createRequest, createResponse } from 'node-mocks-http'
import { hasAccess, validateExistBudget } from '../../../middlewares'
import Budget from '../../../models/Budget.model';
import { budgetsMock } from '../../mocks/budgets.mocks';

jest.mock('../../../models/Budget.model', () => ({
    findByPk: jest.fn(),
}))


describe('Budget Middleware - validateExistBudget', () => {


    it('should handle non exist budget', async () => {

        (Budget.findByPk as jest.Mock).mockResolvedValue(null)

        const req = createRequest({
            params: {
                budgetId: 1
            }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateExistBudget(req, res, next)

        const data = res._getJSONData()

        expect(data.message).toBe('Budget not found')
        expect(res.statusCode).toBe(404)
        expect(next).not.toHaveBeenCalled()
        expect(req.budget).toBeUndefined()
    })

    it('should handle exist budget', async () => {

        (Budget.findByPk as jest.Mock).mockResolvedValue(budgetsMock[0])

        const req = createRequest({
            params: {
                budgetId: 1
            }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateExistBudget(req, res, next)

        expect(res.statusCode).not.toBe(404)
        expect(req.budget).toEqual(budgetsMock[0])
        expect(next).toHaveBeenCalled()
    })
})

describe('Budget Middleware - hasAccess', () => {
    it('should call next() if user has access to budget', () => {

        const req = createRequest({
            budget: budgetsMock[0],
            user: { id: 1 }
        })
        const res = createResponse()
        const next = jest.fn()

        hasAccess(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(next).toHaveBeenCalledTimes(1)
        expect(res.statusCode).not.toBe(404)
        expect(req.budget).toEqual(budgetsMock[0])
        expect(req.user).toEqual({ id: 1 })
    })

    it('should call next() if user has not access to budget, return 401 error', () => {

        (Budget.findByPk as jest.Mock).mockResolvedValue(false)

        const req = createRequest({
            budget: budgetsMock[0],
            user: { id: 2 }
        })
        const res = createResponse()
        const next = jest.fn()

        hasAccess(req, res, next)

        expect(next).not.toHaveBeenCalled()
        expect(res.statusCode).toBe(401)
        expect(res._getJSONData().message).toBe('Invalid Action')
        
    })
})

