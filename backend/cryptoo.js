const Cryptoo = require('cryptoo'); // TODO: use package
const knex = require('./knex');
const config = require('./config');

const cryptoo = new Cryptoo({
  network: config.bitcoinNetwork,
  secret: 'sample secret key',
});

cryptoo.on('unconfirmedTx', async (data) => {
  const { txHash, address, value } = data;
  const paymentId = await knex('payments')
    .where({ address })
    .update({ value, txHash });
  console.log(`payment get unconfirmedTx value ${value}, is addr in db? ${paymentId}`);
});

cryptoo.on('confirmedTx', async (data) => {
  const { txHash, address, value } = data;
  const paymentId = await knex('payments')
    .where({ address })
    .update({ confirmedValue: value, txHash });
  console.log(`payment get confirmed value ${value}, is addr in db? ${paymentId}`);
});

module.exports = cryptoo;
