const knex = require('../db/knex');

const addMenu = async (req, res) => {
  const { id, day_of_week, menu_number } = req.body;

  try {
    const existingMenu = await knex('menus')
      .where('day_of_week', day_of_week)
      .andWhere('menu_number', menu_number)
      .first();

    if (existingMenu) {
      return res.status(400).json({ message: 'Меню с таким номером для этого дня уже существует' });
    } else {
      await knex('menus').insert({ id, day_of_week, menu_number });
      res.status(201).json({ message: 'Menu added successfully!' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding menu' });
  }
};

const updateMenu = async (req, res) => {
  const { id } = req.params;
  const { day_of_week, menu_number } = req.body;

  try {
    const menu = await knex('menus').where('id', id).first();
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    await knex('menus')
      .where('id', id)
      .update({ day_of_week, menu_number });
    res.status(200).json({ message: 'Menu updated successfully!' });
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({ message: 'Error updating menu' });
  }
};

const deleteMenu = async (req, res) => {
  const { id } = req.params;

  try {
    const menu = await knex('menus').where('id', id).first();
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    await knex('menus').where('id', id).del();
    res.status(200).json({ message: 'Menu deleted successfully!' });
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).json({ message: 'Error deleting menu' });
  }
};

module.exports = { addMenu, updateMenu, deleteMenu };
