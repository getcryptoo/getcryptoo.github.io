const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const assert = require('assert');
const path = require('path');
const rateLimit = require('express-rate-limit');
const knex = require('./knex');
const config = require('./config');
const cryptoo = require('./cryptoo');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// TODO: did not serve frontend code in production env
const frontendCode = path.join(__dirname, '../frontend');
if (process.env.NODE_ENV !== 'production') app.use('/', express.static(frontendCode));

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
});

/**
 * @api {post} /askForPayment ask for payment url
 * @apiParamExample {json} Request-Body-Example:
 *  {
 *      "name": "timqian",
 *      "url": "http://timqian.com",
 *      "email": "timqian92@qq.com",
 *  }
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *  {
 *      "id": 1,
 *      "address": "1GMX83pyYDR2yPzTJVLopCMrKYUnhq2KBc",
 *      "name": "timqian",
 *      "url": "http://timqian.com",
 *      "email": "timqian92@qq.com",
 *  }
 */
app.post('/askForPayment', limiter, async (req, res) => {
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

/**
 * @api {get} /payments query existed payments
 * @apiParamExample {json} Request-Example:
 *  {
 *      "orderBy": "createdAt",
 *      "order": "desc",
 *      "limit": "5",
 *      "offset": "0",
 *  }
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *  [{
 *      "id": 1,
 *      "address": "1GMX83pyYDR2yPzTJVLopCMrKYUnhq2KBc",
 *      "name": "timqian",
 *      "url": "http://timqian.com",
 *  }]
 */
app.get('/payments', async (req, res) => {
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

/**
 * @api {get} /payment query one payment with id
 * @apiParamExample {json} Request-Example:
 *  {
 *      "id": 1
 *  }
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *  {
 *      "id": 1,
 *      "address": "1GMX83pyYDR2yPzTJVLopCMrKYUnhq2KBc",
 *      "name": "timqian",
 *      "url": "http://timqian.com",
 *      "value": 3000,
 *      "confirmedValue": 3000
 *  }
 */
app.get('/payment', async (req, res) => {
  const { id } = req.query;
  const [payment] = await knex('payments')
    .where({ id });

  res.json(payment);
});

app.listen(config.serverPort, () => {
  console.log(`Server starts at http://localhost:${config.serverPort}`);
});

cryptoo.getRecoveryPhrase()
  .then(phrase => console.log('\nwallet recovery phrase:', phrase));
