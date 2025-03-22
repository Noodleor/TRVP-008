const express = require('express');
const knex = require('../db/knex');
const router = express.Router();
const { addMenu, updateMenu, deleteMenu } = require('../controllers/menuController');

router.get('/', async (req, res) => {
  try {
    const menus = await knex('menus').select('*');
    res.status(200).json(menus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching menus' });
  }
});

router.post('/', addMenu);

router.put('/:id', updateMenu);

router.delete('/:id', deleteMenu);

module.exports = router;
