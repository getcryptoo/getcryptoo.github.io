const path = require('path');

module.exports = {
  serverPort: 7777,
  dbFilePath: path.join(__dirname, '../db.sqlite'),
  bitcoinNetwork: 'main', // modify it to 'testnet' if you want to test on testnet
};
