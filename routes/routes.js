const express = require('express');

const {
    createExpensive, 
    getExpensivesDetails, 
    expensiveSearch, 
    deleteExpensive, 
    getExpensiveDetailsById, 
    updateExpensive, 
    createCategory, 
    getCategory, 
    fetchExpensivesByCategory,
    updateCategory,
    deleteCategory,
    getExpByInputnFilter
} = require('../controllers/controllers')

const router = express.Router();

router.get('/expensives/:owner',getExpensivesDetails)

router.post('/expensive', createExpensive)

router.get('/:owner/search/:input', expensiveSearch) 

router.delete('/:owner/expensive/:id', deleteExpensive)

router.get('/:owner/expensive/:id',getExpensiveDetailsById)

router.put('/:owner/expensive/:id',updateExpensive)

router.post('/:owner/category',createCategory)

router.get('/:owner/category',getCategory)

router.get('/:owner/expensives/:category',fetchExpensivesByCategory)

router.put('/:owner/category/:id',updateCategory)

router.delete('/:owner/category/:id',deleteCategory)

router.get('/:owner/expensives', getExpByInputnFilter)

module.exports = router