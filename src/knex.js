const Knex = require('knex');
const config = require('./config');

const knex = Knex({
  client: 'sqlite3',
  connection: {
    filename: config.dbFilePath,
  },
  useNullAsDefault: true,
});

module.exports = knex;
