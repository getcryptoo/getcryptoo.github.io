const axios = require('axios');
const config = require('../backend/config');
require('should');

const req = axios.create({
  baseURL: `http://localhost:${config.serverPort}`,
});

let payment;

test('/askForPayment', async () => {
  const res = await req.post('/askForPayment', {
    name: 'tim',
    url: 'timqian.com',
    email: 'timqian92@qq.com',
  });

  payment = res.data;

  await req.post('/askForPayment', {
    name: 'tim',
    url: 'timqian.com',
    email: 'timqian92@qq.com',
  });

  await req.post('/askForPayment', {
    name: 'tim',
    url: 'timqian.com',
    email: 'timqian92@qq.com',
  });

  // test rate limit
  try {
    await req.post('/askForPayment', {
      name: 'tim',
      url: 'timqian.com',
      email: 'timqian92@qq.com',
    });
  } catch (error) {
    error.response.status.should.equal(429);
  }
});

test('/payments', async () => {
  const res = await req.get('/payments', {
    params: {
      orderBy: 'createdAt',
      order: 'desc', // 'asc' or 'desc'
      limit: 2,
      offset: 0,
    },
  });
  console.log(res.data);
});

test('/payment', async () => {
  const handle = setInterval(async () => {
    const res = await req.get('/payment', {
      params: {
        id: payment.id,
      },
    });
    payment = res.data;
    if (payment.value === null) {
      console.log(payment.address);
      console.log('Pay some bitcoins to the above address.');
    } else {
      clearInterval(handle);
      console.log('saw payment:', payment.value);
    }
  }, 2000);
});
