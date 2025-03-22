const express = require('express');
const knex = require('../db/knex');
const router = express.Router();
const { getDishes, addDish } = require('../controllers/dishController');

router.get('/', getDishes);

router.post('/', addDish);

module.exports = router;
