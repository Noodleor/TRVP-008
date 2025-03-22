// src/db/knex.js
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: '',
    database: 'restaurant',
  },
});

module.exports = knex;

