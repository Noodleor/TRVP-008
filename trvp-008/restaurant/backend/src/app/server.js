// src/app/server.js

const express = require('express');
const path = require('path');
const app = express();
const menuRoutes = require('../routes/menuRoutes');
const dishRoutes = require('../routes/dishRoutes');
const menuDishRoutes = require('../routes/menuDishRoutes');

const knex = require('../db/knex');


const PORT = 3000;

app.use(express.static(path.join(__dirname, '../../../frontend')))

app.use(express.json());

app.use('/menus', menuRoutes);
app.use('/dishes', dishRoutes);
app.use('/menu_dishes', menuDishRoutes);


app.get('/', (req, res) => {
  res.send('Welcome to the menu API!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
