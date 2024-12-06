const express = require('express');

const {  
    expensiveSearch, 
    createCategory, 
    getCategory, 
    fetchExpensivesByCategory,
    updateCategory,
    deleteCategory,
    getExpByInputnFilter,

    getDetails,
    create,
    getDetailsById,
    updateList,
    deleteinfo,
} = require('../controllers/controllers')

const router = express.Router();

router.get('/get/:owner/:type', getDetails);

router.post('/create', create);

router.get('/:owner/:type/:id',getDetailsById)

router.put('/:type/:id',updateList)

router.delete('/:owner/:type/:id',deleteinfo)

router.get('/:owner/search/:input', expensiveSearch)

router.get('/:owner/expensives', getExpByInputnFilter)

router.get('/:owner/expensives/:category',fetchExpensivesByCategory)

router.post('/category/:owner',createCategory)

router.get('/category/:owner',getCategory)

router.put('/category/:owner/:id',updateCategory)

//router.delete('/category/:owner/:id',deleteCategory)

module.exports = router