import { createRequest, createResponse } from 'node-mocks-http'
import { AuthController } from '../../../controllers/Auth.controller'
import User from '../../../models/User.model'
import { comparePassword, generateJWT, generateToken, hashPassword } from '../../../utils'
import { AuthEmail } from '../../../emails/AuthEmail'


jest.mock('../../../models/User.model', () => ({
    findOne: jest.fn(),
    create: jest.fn(),
}))

jest.mock('../../../utils', () => ({
    hashPassword: jest.fn(),
    generateToken: jest.fn(),
    comparePassword: jest.fn(),
    generateJWT: jest.fn(),
}))

jest.mock('../../../emails/AuthEmail', () => ({
    AuthEmail: {
        sendConfirmationEmail: jest.fn()
    }
}))

describe('AuthControler - register ', () => {

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('Should return a 409 statuscode and as error message if the email is already registered', async () => {

        (User.findOne as jest.Mock).mockResolvedValue(true);

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/register',
            body: {
                name: 'Test',
                email: 'test@register.com',
                passwor: '12345678',
            }
        })

        const res = createResponse()

        await AuthController.register(req, res)

        const data = res._getJSONData()

        expect(data.message).toBe('User already exists')
        expect(res.statusCode).toBe(409)
        expect(User.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalledTimes(1)
    })

    it('Should register a new user and return a success message', async () => {

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/register',
            body: {
                name: 'Test',
                email: 'test@register.com',
                passwor: '12345678',
            }
        })

        const token = '123456'

        const mockUser = { ...req.body, save: jest.fn() };

        (User.create as jest.Mock).mockResolvedValue(mockUser);
        (hashPassword as jest.Mock).mockResolvedValue('12345678');
        (generateToken as jest.Mock).mockReturnValue(token);

        jest.spyOn(AuthEmail, 'sendConfirmationEmail').mockImplementation(() => Promise.resolve());

        const res = createResponse()

        await AuthController.register(req, res)

        const data = res._getJSONData()

        expect(data.message).toBe('User created successfully')
        expect(res.statusCode).toBe(201)
        expect(User.create).toHaveBeenCalled()
        expect(User.create).toHaveBeenCalledTimes(1)
        expect(mockUser.save).toHaveBeenCalled()
        expect(mockUser.save).toHaveBeenCalledTimes(1)
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalled()
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1)
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({
            name: req.body.name,
            email: req.body.email,
            token: token
        })
        expect(hashPassword).toHaveBeenCalled()
        expect(hashPassword).toHaveBeenCalledTimes(1)
        expect(generateToken).toHaveBeenCalled()
        expect(generateToken).toHaveBeenCalledTimes(1)

    })
})

describe('AuthControler - login ', () => {

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('Should return a 404 statuscode and user not found message', async () => {

        (User.findOne as jest.Mock).mockResolvedValue(null);

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: {
                email: 'test@register.com',
                passwor: '1234567',
            }
        })

        const res = createResponse()

        await AuthController.login(req, res)

        const data = res._getJSONData()

        expect(data.message).toBe('User not found')
        expect(res.statusCode).toBe(404)

    })

    it('Should return a 403 statuscode and Unconfirmed account message', async () => {

        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            email: 'test@register.com',
            password: '1234567',
            confirmed: false
        });

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: {
                email: 'test@register.com',
                passwor: '1234567',
            }
        })

        const res = createResponse()

        await AuthController.login(req, res)

        const data = res._getJSONData()

        expect(data.message).toBe('Unconfirmed account')
        expect(res.statusCode).toBe(403)

    })

    it('Should return a 401 statuscode and Invalid password message', async () => {

        const userMock = {
            id: 1,
            email: 'test@register.com',
            password: '1234567',
            confirmed: true
        };

        (User.findOne as jest.Mock).mockResolvedValue(userMock);
        (comparePassword as jest.Mock).mockResolvedValue(false);

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: {
                email: 'test@register.com',
                passwor: '1234567',
            }
        })

        const res = createResponse()

        await AuthController.login(req, res)

        const data = res._getJSONData()

        expect(data.message).toBe('Invalid password')
        expect(res.statusCode).toBe(401)
        expect(comparePassword).toHaveBeenCalled()
        expect(comparePassword).toHaveBeenCalledTimes(1)
        expect(comparePassword).toHaveBeenCalledWith(req.body.password, userMock.password)

    })

    it('Should return JWT token and Login successfully message', async () => {

        const userMock = {
            id: 1,
            email: 'test@register.com',
            password: '12345678',
            confirmed: true
        };

        const testJWT = 'test_JWT';

        (User.findOne as jest.Mock).mockResolvedValue(userMock);
        (comparePassword as jest.Mock).mockResolvedValue(true);
        (generateJWT as jest.Mock).mockReturnValue(testJWT);


        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: {
                email: 'test@register.com',
                passwor: '12345678',
            }
        })

        const res = createResponse()

        await AuthController.login(req, res)

        const data = res._getJSONData()

        expect(data.message).toBe('Login successfully')
        expect(res.statusCode).toBe(200)
        expect(data.token).toEqual(testJWT)
        expect(generateJWT).toHaveBeenCalled()
        expect(generateJWT).toHaveBeenCalledTimes(1)
        expect(generateJWT).toHaveBeenCalledWith(userMock.id)
    })
})