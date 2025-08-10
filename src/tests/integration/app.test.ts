import request from 'supertest'
import server from '../../server'
import { AuthController } from '../../controllers/Auth.controller'
import User from '../../models/User.model';
import * as authUtils from '../../utils/auth';
import * as jwtUtils from '../../utils/jwt'


// Autenticarse y obtener JWT -----------------------

let jwt: string

async function loginUser(data) {
    return await request(server).post('/api/auth/login').send(data);
}

//----------------------------------------------------

describe('Autentication - Register', () => {

    jest.setTimeout(12000); // 12 segundos para todos los tests

    it('Should diplay validation errors when form is empty', async () => {
        const res = await request(server)
            .post('/api/auth/register')
            .send({})

        const createAccountMock = jest.spyOn(AuthController, 'register')

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('errors')
        expect(res.body.errors).toHaveLength(5)
        expect(createAccountMock).not.toHaveBeenCalled()
        expect(res.body.errors[0].msg).toBe('Name is required')
        expect(res.body.errors[1].msg).toBe('Email is required')
        expect(res.body.errors[2].msg).toBe('Invalid email')
        expect(res.body.errors[3].msg).toBe('Password is required')
        expect(res.body.errors[4].msg).toBe('Password must be at least 8 characters')
    })

    it('Should return 400 status code when the email is invalid', async () => {
        const res = await request(server)
            .post('/api/auth/register')
            .send({
                name: 'Test',
                email: 'test2test.com',
                password: '12345678',
            })

        const createAccountMock = jest.spyOn(AuthController, 'register')

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('errors')
        expect(res.body.errors).toHaveLength(1)
        expect(createAccountMock).not.toHaveBeenCalled()
        expect(res.body.errors[0].msg).toBe('Invalid email')
    })

    it('Should return 400 status code when the password does not have 8 characters', async () => {
        const res = await request(server)
            .post('/api/auth/register')
            .send({
                name: 'Test',
                email: 'test@test.com',
                password: '1234567',
            })

        const createAccountMock = jest.spyOn(AuthController, 'register')

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('errors')
        expect(res.body.errors[0].msg).toBe('Password must be at least 8 characters')
        expect(res.body.errors).toHaveLength(1)
        expect(createAccountMock).not.toHaveBeenCalled()
    })

    it('Should return 201 status code when a user is registered successfully', async () => {
        const createAccountMock = jest.spyOn(AuthController, 'register')

        const userData = {
            name: 'Test',
            email: 'test@test.com',
            password: '12345678',
        }

        const res = await request(server)
            .post('/api/auth/register')
            .send(userData)

        expect(res.status).toBe(201)
        expect(res.body).not.toHaveProperty('errors')

    })

    it('Should return 409 status code when a user is already exists', async () => {
        const userData = {
            name: 'Test',
            email: 'test@test.com',
            password: '12345678',
        }

        const res = await request(server)
            .post('/api/auth/register')
            .send(userData)

        expect(res.status).toBe(409)
        expect(res.status).not.toBe(201)
        expect(res.body.message).toBe('User already exists')

    })
})

describe('Autentication - Account confirmation with token', () => {

    jest.setTimeout(12000); // 12 segundos para todos los tests

    it('Should diplay error with token is empty or token is not valid', async () => {
        const res = await request(server)
            .post('/api/auth/confirm-account')
            .send({
                token: ''
            })

        const confirmAccountMock = jest.spyOn(AuthController, 'confirmAccount')

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('errors')
        expect(res.body.errors).toHaveLength(1)
        expect(confirmAccountMock).not.toHaveBeenCalled()
        expect(res.body.errors[0].msg).toBe('Invalid token')
    })

    it('Should confirm account with a valid token', async () => {

        const token = globalThis.budgetConfirmationToken

        const res = await request(server)
            .post('/api/auth/confirm-account')
            .send({ token })

        expect(res.status).toBe(200)
        expect(res.body).not.toHaveProperty('error')
        expect(res.body.message).toBe('Account confirmed successfully')

    })
})

// Nuevo modelo con async function

describe('Autentication - Login', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const user = { id: 1, email: 'test@test.com', password: '12345678', confirmed: true }
    const dataRegister = { name: 'juan', email: 'juan@mail.com', password: '12345678' }
    const emptyUser = {}
    const invalidEmail = { email: 'juan@mail', password: '12345678' }
    const invalidPassword = { id: 1, confirmed: true, email: 'test@test.com', password: '12345678' }
    const userNotFound = { email: 'juan222@mail.com', password: '12345678' }
    const unconfirmedUser = { id: 1, confirmed: false, email: 'unconfirmed@mail.com', password: '12345678' }

    it('Should display validation errors when the form is empty', async () => {

        const res = await loginUser(emptyUser);

        const loginMock = jest.spyOn(AuthController, 'login')

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('errors')
        expect(res.body.errors).toHaveLength(3)
        expect(loginMock).not.toHaveBeenCalled()
        expect(res.body.errors[0].msg).toBe('Email is required')
        expect(res.body.errors[1].msg).toBe('Invalid email')
        expect(res.body.errors[2].msg).toBe('Password is required')
    })

    it('Should return 400 status code when the email is invalid', async () => {

        const res = await loginUser(invalidEmail);

        const loginMock = jest.spyOn(AuthController, 'login')

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('errors')
        expect(res.body.errors).toHaveLength(1)
        expect(loginMock).not.toHaveBeenCalled()
        expect(res.body.errors[0].msg).toBe('Invalid email')
    })

    it('Should return 404 status code when the user not found', async () => {

        const res = await loginUser(userNotFound);

        const loginMock = jest.spyOn(AuthController, 'login')

        expect(res.status).toBe(404)
        expect(res.body.message).toBe('User not found')
    })

    it('Should return 403 status code when the user unconfirmed account', async () => {

        (jest.spyOn(User, 'findOne') as jest.Mock).mockResolvedValue(unconfirmedUser)

        const res = await loginUser(unconfirmedUser);

        const loginMock = jest.spyOn(AuthController, 'login')

        expect(res.status).toBe(403)
        expect(res.body.message).toBe('Unconfirmed account')

    })

    it('Should return 403 status code when the user unconfirmed account seconf test', async () => {

        await request(server).post('/api/auth/register').send(dataRegister)

        const res = await loginUser({
            email: dataRegister.email,
            password: dataRegister.password
        });

        expect(res.status).toBe(403)
        expect(res.body.message).toBe('Unconfirmed account')

    })

    it('Should return 401 status code when the password user is invalid', async () => {

        const findOne = (jest.spyOn(User, 'findOne') as jest.Mock).mockResolvedValue(invalidPassword)
        const comparePassword = jest.spyOn(authUtils, 'comparePassword').mockResolvedValue(false)

        const res = await loginUser(invalidPassword);

        expect(res.status).toBe(401)
        expect(res.body.message).toBe('Invalid password')
        expect(findOne).toHaveBeenCalledTimes(1)
        expect(comparePassword).toHaveBeenCalledTimes(1)

    })

    it('Should return 201 status code when the user created successfully', async () => {

        const findOne = (jest.spyOn(User, 'findOne') as jest.Mock).mockResolvedValue(user);
        const comparePassword = jest.spyOn(authUtils, 'comparePassword').mockResolvedValue(true);
        const jwt = jest.spyOn(jwtUtils, 'generateJWT').mockReturnValue('jwt_token');

        const res = await loginUser(user);

        expect(res.status).toBe(200)
        expect(res.body).not.toHaveProperty('error')
        expect(res.body.message).toBe('Login successfully')
        expect(findOne).toHaveBeenCalled()
        expect(findOne).toHaveBeenCalledTimes(1)
        expect(comparePassword).toHaveBeenCalled()
        expect(comparePassword).toHaveBeenCalledTimes(1)
        expect(jwt).toHaveBeenCalled()
        expect(jwt).toHaveBeenCalledTimes(1)

    })
})


describe('GET - /api/budgets', () => {

    const userData = {
        email: 'test@test.com',
        password: '12345678'
    }

    beforeAll(async () => {
        jest.restoreAllMocks();

        const res = await loginUser(userData)

        jwt = res.body.token; // Extraer solo el token

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(jwt).not.toBeNull();
    })

    it('Should reject unauthenticated access without a JWT', async () => {
        const res = await request(server)
            .get('/api/budgets');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Unauthorized User');
    })

    it('Should reject invalid JWT token', async () => {
        const res = await request(server)
            .get('/api/budgets')
            .set('Authorization', 'Bearer invalid_token'); // Usar .set() en lugar de auth

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Invalid Token');
    })

    it('Should allow authenticated access with valid a JWT', async () => {
        const res = await request(server)
            .get('/api/budgets')
            .set('Authorization', `Bearer ${jwt}`)

        expect(res.status).toBe(200)
    })
})

describe('POST - /api/budgets', () => {

    const userData = {
        email: 'test@test.com',
        password: '12345678'
    }

    beforeAll(async () => {
        jest.restoreAllMocks();

        const res = await loginUser(userData)

        jwt = res.body.token; // Extraer solo el token

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(jwt).not.toBeNull();
    })

    it('Should reject unauthenticated post request to budget without a JWT', async () => {
        const res = await request(server)
            .post('/api/budgets')

        expect(res.status).toBe(401)
        expect(res.body.message).toBe('Unauthorized User')
    })

    it('You may not be able to generate a budget because the form is empty.', async () => {
        const res = await request(server)
            .post('/api/budgets')
            .set('Authorization', `Bearer ${jwt}`)
            .send({})

        expect(res.status).toBe(400)
        expect(res.body.errors).toHaveLength(4)
        expect(res.body.errors[0].msg).toBe('Name is required')
        expect(res.body.errors[1].msg).toBe('Amount is required')
        expect(res.body.errors[2].msg).toBe('Amount must be a number')
        expect(res.body.errors[3].msg).toBe('Amount must be greater than 0')
    })

    it('should generate a budget successfully', async () => {
        const res = await request(server)
            .post('/api/budgets')
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                name: 'budget1',
                amount: 1000
            })

        expect(res.status).toBe(201)
        expect(res.body.message).toBe('Budget created successfully')
        
    })

});

describe('GET - /api/budgets/:id', () => {

    const userData = {
        email: 'test@test.com',
        password: '12345678'
    }

    beforeAll(async () => {
        jest.restoreAllMocks();

        const res = await loginUser(userData)

        jwt = res.body.token; // Extraer solo el token

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(jwt).not.toBeNull();
    })

    it('Should reject unauthenticated get request to budget ID without a JWT', async () => {
        const res = await request(server)
            .get('/api/budgets/1')

        expect(res.status).toBe(401)
        expect(res.body.message).toBe('Unauthorized User')
    })

    it('Should have 400 error when get request to budget with incorrect url', async () => {
        const res = await request(server)
            .get('/api/budgets/hola')
            .set('Authorization', `Bearer ${jwt}`)

        expect(res.status).toBe(400)
        expect(res.status).not.toBe(401)
        expect(res.body.errors).toBeDefined()
        expect(res.body.errors[0].msg).toBe('Invalid id')
        
    })

    it('Should have 404 error when a budget not found', async () => {
        const res = await request(server)
            .get('/api/budgets/3000')
            .set('Authorization', `Bearer ${jwt}`)

        expect(res.status).toBe(404)
        expect(res.status).not.toBe(401)
        expect(res.body.message).toBe('Budget not found')
        
    })

    it('Should a single budget by Id', async () => {
        const res = await request(server)
            .get('/api/budgets/1')
            .set('Authorization', `Bearer ${jwt}`)

        expect(res.status).toBe(200)
        expect(res.status).not.toBe(401)
        
    })
})

describe('PUT - /api/budgets/:id', () => {

    const userData = {
        email: 'test@test.com',
        password: '12345678'
    }

    beforeAll(async () => {
        jest.restoreAllMocks();

        const res = await loginUser(userData)

        jwt = res.body.token; // Extraer solo el token

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(jwt).not.toBeNull();
    })

    it('Should reject unauthenticated put request to budget ID without a JWT', async () => {
        const res = await request(server)
            .put('/api/budgets/1')

        expect(res.status).toBe(401)
        expect(res.body.message).toBe('Unauthorized User')
    })

    it('You may not be able to update a budget because the form is empty.', async () => {
        const res = await request(server)
            .put('/api/budgets')
            .set('Authorization', `Bearer ${jwt}`)
            .send({})

        expect(res.status).toBe(404)
        
    })

    it('Should a single budget by Id', async () => {
        const res = await request(server)
            .put('/api/budgets/1')
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                name: 'update_budget',
                amount: 3000
            })

        expect(res.status).toBe(200)
        expect(res.body.message).toBe('Budget updated successfully')
        
    })
})

describe('DELETE - /api/budgets/:id', () => {

    const userData = {
        email: 'test@test.com',
        password: '12345678'
    }

    beforeAll(async () => {
        jest.restoreAllMocks();

        const res = await loginUser(userData)

        jwt = res.body.token; // Extraer solo el token

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(jwt).not.toBeNull();
    })

    it('Should reject unauthenticated delete request to budget ID without a JWT', async () => {
        const res = await request(server)
            .delete('/api/budgets/1')

        expect(res.status).toBe(401)
        expect(res.body.message).toBe('Unauthorized User')
    })

    it('Should return 404  not found when a budget doesnt exists', async () => {
        const res = await request(server)
            .delete('/api/budgets/3000')
            .set('Authorization', `Bearer ${jwt}`)
        
        expect(res.status).toBe(404)
        expect(res.body.message).toBe('Budget not found')
        
    })

    it('Should delete budget by Id', async () => {
        const res = await request(server)
            .delete('/api/budgets/1')
            .set('Authorization', `Bearer ${jwt}`)
        
        expect(res.status).toBe(200)
        expect(res.body.message).toBe('Budget deleted successfully')
        
    })
})