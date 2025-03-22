// src/routes/menuDishRoutes.js
const express = require('express');
const router = express.Router();
const { addDishToMenu, getDishesForMenu, deleteDishFromMenu, updateDishOrderInMenu, moveDishBetweenMenus } = require('../controllers/menuDishController');

router.post('/:menu_id/', addDishToMenu);  

router.get('/:menu_id', getDishesForMenu);

router.delete('/:menu_id/:dish_id', deleteDishFromMenu);

router.patch('/:menu_id/:dish_id', updateDishOrderInMenu);

router.post('/move_dish/:dishId', moveDishBetweenMenus);

module.exports = router;
