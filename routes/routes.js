const express = require('express');
const {createWorker, getWorkersDetails, searchByName,searchByArea, deleteWorker, getWorkerDetailsById, updateWorker} = require('../controllers/controllers')

const router = express.Router();

router.get('/workers/:owner',getWorkersDetails)

router.post('/workers', createWorker)

router.get('/search-by-name/:inputText', searchByName) //query according to the owner

router.get('/search-by-area/:inputText', searchByArea) //query according to the owner

router.delete('/workers/:id', deleteWorker)

router.get('/worker/:id',getWorkerDetailsById)

router.put('/worker/:id',updateWorker)

module.exports = router