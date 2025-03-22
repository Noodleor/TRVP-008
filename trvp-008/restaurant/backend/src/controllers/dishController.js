const knex = require('../db/knex');

const getDishes = async (req, res) => {
  try {
    const dishes = await knex('dishes').select('*');
    res.status(200).json(dishes);
  } catch (error) {
    console.error('Error fetching dishes:', error);
    res.status(500).json({ message: 'Error fetching dishes' });
  }
};

const addDish = async (req, res) => {
  const { id, name, description } = req.body;

  try {
    await knex('dishes').insert({ id, name, description });
    res.status(201).json({ message: 'Dish added successfully!' });
  } catch (error) {
    console.error('Error adding dish:', error);
    res.status(500).json({ message: 'Error adding dish' });
  }
};

module.exports = { getDishes, addDish };
