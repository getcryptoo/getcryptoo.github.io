const fs = require('fs');
const path = require('path');
const knex = require('../src/knex');
const { dbFilePath } = require('../src/config');

const initDBSQL = fs.readFileSync(path.join(__dirname, './initDb.sql'), 'utf8');

async function initDB() {
  console.log('going to rm db');
  try {
    fs.unlinkSync(dbFilePath);
  } catch (error) {
    console.log(error);
    console.log('db file not found and will create one');
  }

  console.log('going to init db');
  await knex.raw(initDBSQL);

  knex.destroy();
}

module.exports = initDB;

initDB();
