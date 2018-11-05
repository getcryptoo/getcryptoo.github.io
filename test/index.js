const axios = require('axios');
const config = require('../src/config');
require('should');

const host = `http://localhost:${config.serverPort}`;

let payment;

test('/askForPayment', async () => {
  const res = await axios.post(`${host}/askForPayment`, {
    name: 'tim',
    url: 'timqian.com',
    email: 'timqian92@qq.com',
  });

  payment = res.data;
});

test('/addresses', async () => {
  const res = await axios.get(`${host}/addresses`, {
    params: {
      orderBy: 'createdAt',
      order: 'desc', // 'asc' or 'desc'
      limit: 10,
      offset: 0,
    },
  });
  console.log(res.data);
});

test('/address', async () => {
  setInterval(async () => {
    const res = await axios.get(`${host}/address`, {
      params: {
        id: payment.id,
      },
    });
    console.log(res.data);
  }, 2000);
});
