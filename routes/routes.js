const express = require('express');
const {createworker, getWorkersDetails} = require('../controllers/controllers')

const router = express.Router();

router.get('/workers/:owner',getWorkersDetails)

router.post('/workers', createworker)

module.exports = router