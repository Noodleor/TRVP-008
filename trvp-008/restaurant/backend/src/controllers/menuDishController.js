// src/controllers/menuDishController.js
const knex = require('../db/knex');

const addDishToMenu = async (req, res) => {
  const { menu_id } = req.params;
  const { dish_id } = req.body;

  try {
    console.log(`Received request to add dish ${dish_id} to menu ${menu_id}`);

    const menu = await knex('menus').where('id', menu_id).first();
    if (!menu) {
      console.log(`Menu with ID ${menu_id} not found`);
      return res.status(404).json({ message: 'Menu not found' });
    }

    const dish = await knex('dishes').where('id', dish_id).first();
    if (!dish) {
      console.log(`Dish with ID ${dish_id} not found`);
      return res.status(404).json({ message: 'Dish not found' });
    }

    const dishCategory = dish.type;
    const existingDishInMenu = await knex('menu_dishes')
      .join('dishes', 'menu_dishes.dish_id', 'dishes.id')
      .where('menu_dishes.menu_id', menu_id)
      .andWhere('dishes.type', dishCategory)
      .first();

    if (existingDishInMenu) {
      console.log(`Dish ${dish_id} already exists in menu ${menu_id}`);
      return res.status(400).json({ message: 'Dish already exists in the menu' });
    }

    await knex('menu_dishes').insert({ menu_id, dish_id });
    console.log(`Dish ${dish_id} added to menu ${menu_id} successfully`);
    res.status(201).json({ message: 'Dish added to menu successfully!' });
  } catch (error) {
    console.error('Error adding dish to menu:', error);
    res.status(500).json({ message: 'Error adding dish to menu' });
  }
};

const getDishesForMenu = async (req, res) => {
  const { menu_id } = req.params;

  try {
    const dishes = await knex('menu_dishes')
      .join('dishes', 'menu_dishes.dish_id', '=', 'dishes.id')
      .where('menu_dishes.menu_id', menu_id)
      .select('dishes.id', 'dishes.name');

    res.status(200).json(dishes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dishes from menu' });
  }
};

const deleteDishFromMenu = async (req, res) => {
  const { menu_id, dish_id } = req.params;

  try {
    console.log(`Received request to delete dish ${dish_id} from menu ${menu_id}`);

    const menu = await knex('menus').where('id', menu_id).first();
    if (!menu) {
      console.log(`Menu with ID ${menu_id} not found`);
      return res.status(404).json({ message: 'Menu not found' });
    }

    const dishInMenu = await knex('menu_dishes')
      .where('menu_id', menu_id)
      .andWhere('dish_id', dish_id)
      .first();

    if (!dishInMenu) {
      console.log(`Dish ${dish_id} not found in menu ${menu_id}`);
      return res.status(404).json({ message: 'Dish not found in menu' });
    }

    await knex('menu_dishes')
      .where('menu_id', menu_id)
      .andWhere('dish_id', dish_id)
      .del();
    
    console.log(`Dish ${dish_id} deleted from menu ${menu_id} successfully`);
    res.status(200).json({ message: 'Dish deleted from menu successfully!' });
  } catch (error) {
    console.error('Error deleting dish from menu:', error);
    res.status(500).json({ message: 'Error deleting dish from menu' });
  }
};


const updateDishOrderInMenu = async (req, res) => {
  const { source_menu_id, target_menu_id, dish_id } = req.params;
  const { new_order } = req.body;

  try {
    console.log(`Received request to move dish ${dish_id} from menu ${source_menu_id} to menu ${target_menu_id} with new order ${new_order}`);

    const sourceMenu = await knex('menus').where('id', source_menu_id).first();
    if (!sourceMenu) {
      console.log(`Source menu with ID ${source_menu_id} not found`);
      return res.status(404).json({ message: 'Source menu not found' });
    }

    const targetMenu = await knex('menus').where('id', target_menu_id).first();
    if (!targetMenu) {
      console.log(`Target menu with ID ${target_menu_id} not found`);
      return res.status(404).json({ message: 'Target menu not found' });
    }

    const dish = await knex('dishes').where('id', dish_id).first();
    if (!dish) {
      console.log(`Dish with ID ${dish_id} not found`);
      return res.status(404).json({ message: 'Dish not found' });
    }

    const dishCategory = dish.type;

    const sameCategoryDishInTarget = await knex('menu_dishes')
      .join('dishes', 'menu_dishes.dish_id', 'dishes.id')
      .where('menu_dishes.menu_id', target_menu_id)
      .andWhere('dishes.type', dishCategory)
      .first();

    if (sameCategoryDishInTarget) {
      console.log(`Dish of category ${dishCategory} already exists in target menu ${target_menu_id}`);
      return res.status(400).json({ message: `Dish of category ${dishCategory} already exists in the target menu` });
    }

    // Удаляем блюдо из исходного меню
    await knex('menu_dishes')
      .where('menu_id', source_menu_id)
      .andWhere('dish_id', dish_id)
      .del();

    console.log(`Dish ${dish_id} removed from source menu ${source_menu_id}`);

    await knex('menu_dishes').insert({
      menu_id: target_menu_id,
      dish_id,
      order: new_order,
    });

    console.log(`Dish ${dish_id} added to target menu ${target_menu_id} with order ${new_order}`);

    res.status(200).json({ message: 'Dish moved between menus successfully!' });
  } catch (error) {
    console.error('Error moving dish between menus:', error);
    res.status(500).json({ message: 'Error moving dish between menus' });
  }
};

const moveDishBetweenMenus = async (req, res) => {
  const { dishId } = req.params;
  const { sourceMenuId, targetMenuId } = req.body;

  try {
    const dishInSourceMenu = await knex('menu_dishes')
      .where('menu_id', sourceMenuId)
      .andWhere('dish_id', dishId)
      .first();

    if (!dishInSourceMenu) {
      return res.status(404).json({ message: 'Dish not found in source menu' });
    }

    const dish = await knex('dishes').where('id', dishId).first();
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    const dishCategory = dish.type;

    const sameCategoryDishInTarget = await knex('menu_dishes')
      .join('dishes', 'menu_dishes.dish_id', 'dishes.id')
      .where('menu_dishes.menu_id', targetMenuId)
      .andWhere('dishes.type', dishCategory)
      .first();

    if (sameCategoryDishInTarget) {
      return res.status(400).json({ message: `Dish of category ${dishCategory} already exists in the target menu` });
    }


    await knex('menu_dishes')
      .where('menu_id', sourceMenuId)
      .andWhere('dish_id', dishId)
      .del();

    await knex('menu_dishes').insert({ menu_id: targetMenuId, dish_id: dishId });

    res.status(200).json({ message: 'Dish moved successfully' });
  } catch (error) {
    console.error('Error moving dish:', error);
    res.status(500).json({ message: 'Error moving dish' });
  }
};



module.exports = { addDishToMenu, getDishesForMenu, deleteDishFromMenu, updateDishOrderInMenu, moveDishBetweenMenus };
