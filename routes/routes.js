const express = require('express');
const {createExpensive, getExpensivesDetails, expensiveSearch, deleteExpensive, getExpensiveDetailsById, updateExpensive} = require('../controllers/controllers')

const router = express.Router();

router.get('/expensives/:owner',getExpensivesDetails)

router.post('/expensive', createExpensive)

router.get('/:owner/search/:input', expensiveSearch) 

router.delete('/:owner/expensive/:id', deleteExpensive)

router.get('/:owner/expensive/:id',getExpensiveDetailsById)

router.put('/:owner/expensive/:id',updateExpensive)

module.exports = router