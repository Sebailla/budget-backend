import { Router } from "express"
import { BudgetController } from "../controllers/Budget.controller"
import { authenticateUser, handleInputErrors, hasAccess, validateBudgetData, validateBudgetId, validateExistBudget, validateExistExpense, validateExpensesData, validateExpensesId } from "../middlewares"
import { ExpenseController } from "../controllers/Expense.controller"

const router = Router()


//? Params

router.use(authenticateUser) // All routs authenticate

router.param('budgetId', validateBudgetId)
router.param('budgetId', validateExistBudget)
router.param('budgetId', hasAccess)

router.param('expenseId', validateExpensesId)
router.param('expenseId', validateExistExpense)



//? --------------------------------
//! Route for Budget

router.get('/', BudgetController.getAll)

router.get('/:budgetId', BudgetController.getById)

router.post('/',
    validateBudgetData,
    handleInputErrors,
    BudgetController.create)

router.put('/:budgetId',
    validateBudgetData,
    handleInputErrors,
    BudgetController.update)

router.delete('/:budgetId', BudgetController.delete)

//? --------------------------------
//! Route for Expenses (Patron ROA)

router.get('/:budgetId/expenses', ExpenseController.getAll)

router.get('/:budgetId/expenses/:expenseId', ExpenseController.getById)

router.post('/:budgetId/expenses', 
    validateExpensesData,
    handleInputErrors,
    ExpenseController.create)

router.put('/:budgetId/expenses/:expenseId', 
    validateExpensesData,
    handleInputErrors,
    ExpenseController.updateById)

router.delete('/:budgetId/expenses/:expenseId', ExpenseController.deleteById)

//? --------------------------------

export default router