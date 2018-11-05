const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const assert = require('assert');
const path = require('path');
const Cryptoo = require('../../cryptoo-v2/src/index'); // TODO: use package
const knex = require('./knex');
const config = require('./config');

const cryptoo = new Cryptoo({
  network: 'testnet',
  chainDataFolder: '.bc',
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

const app = express();
app.use(cors());
app.use(bodyParser.json());

const frontendCode = path.join(__dirname, '../frontend');
app.use('/', express.static(frontendCode));

app.post('/askForPayment', async (req, res) => {
  const { name, url, email } = req.body;
  // TODO: validate email
  // TODO: validate url
  const address = await cryptoo.createAddress();

  const insertRes = await knex('payments')
    .insert({
      address, name, url, email,
    });

  const [paymentId] = insertRes;

  const [payment] = await knex('payments')
    .where({ id: paymentId });

  res.json(payment);
});

app.get('/addresses', async (req, res) => {
  const {
    orderBy,
    order,
    limit,
    offset,
  } = req.query;

  // TODO: limit params possibilities

  // only return addresses with value
  const payments = await knex('payments')
    .whereNot('value', null)
    .limit(limit)
    .offset(offset)
    .orderBy(orderBy, order);

  res.json(payments);
});

app.get('/address', async (req, res) => {
  const { id } = req.query;
  const [payment] = await knex('payments')
    .where({ id });

  res.json(payment);
});

app.listen(config.serverPort, () => {
  console.log('Portal is up on', config.serverPort);
});
