const express = require('express');
const {createExpensive, getExpensivesDetails, searchByName,searchByArea, deleteExpensive, getExpensiveDetailsById, updateExpensive} = require('../controllers/controllers')

const router = express.Router();

router.get('/expensives/:owner',getExpensivesDetails)

router.post('/expensive', createExpensive)

router.post('/search-by-name', searchByName) //query according to the owner

router.get('/search-by-area/:inputText', searchByArea) //query according to the owner

router.delete('/:owner/expensive/:id', deleteExpensive)

router.get('/:owner/expensive/:id',getExpensiveDetailsById)

router.put('/:owner/expensive/:id',updateExpensive)

module.exports = router