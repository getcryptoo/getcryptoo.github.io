const path = require('path');

module.exports = {
  serverPort: 8081,
  dbFilePath: path.join(__dirname, '../db.sqlite'),
};
