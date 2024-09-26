const express = require('express');
const {createworker, getWorkersDetails, searchByName,searchByArea} = require('../controllers/controllers')

const router = express.Router();

router.get('/workers/:owner',getWorkersDetails)

router.post('/workers', createworker)

router.get('/search-by-name/:inputText', searchByName) //query according to the owner

router.get('/search-by-area/:inputText', searchByArea) //query according to the owner

module.exports = router