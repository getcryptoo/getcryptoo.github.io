const paymentBtn = document.querySelector('.payment-btn');
const addrInput = document.querySelector('.addr-input');
const qrcodeDiv = document.getElementById('qrcode');
const qrcode = new QRCode(qrcodeDiv);

const { href } = window.location;
const baseURL = href.indexOf('localhost') || href.indexOf('192.168') || href.indexOf('127.0.0.1') ? href : 'https://api.getcryptoo.com';
const req = axios.create({
  baseURL,
});

// https://stackoverflow.com/a/5166806/4674834
function looksLikeMail(str) {
  const lastAtPos = str.lastIndexOf('@');
  const lastDotPos = str.lastIndexOf('.');
  return (lastAtPos < lastDotPos && lastAtPos > 0 && str.indexOf('@@') == -1 && lastDotPos > 2 && (str.length - lastDotPos) > 2);
}

function looksLikeUrl(str) {
  return str.startsWith('http');
}

function paramCheck({ name, url, email }) {
  if (!name) {
    alert('Thanks for you donation, Please provide a name.');
    throw new Error('no name');
  }
  if (url && !looksLikeUrl(url)) {
    alert('url should starts with "http"');
    throw new Error('bad url');
  }
}

let intervalHandle;
paymentBtn.addEventListener('click', () => {
  const name = document.querySelector('.payment-name').value;
  const url = document.querySelector('.payment-url').value;
  const email = document.querySelector('.payment-email').value;

  //  validate infos
  paramCheck({ name, url, email });

  req.post('/askForPayment', {
    name,
    url,
    email,
  }).then((res) => {
    const addr = res.data.address;
    const paymentId = res.data.id;
    qrcode.makeCode(`bitcoin:${addr}`);
    addrInput.value = addr;
    addrInput.style.display = 'block';

    if (intervalHandle) clearInterval(intervalHandle);
    // start pulling the address to see if value is updated
    intervalHandle = setInterval(() => {
      req.get('/payment', {
        params: {
          id: paymentId,
        },
      }).then((res) => {
        const { value } = res.data;
        if (value) {
          renderTable();
          clearInterval(intervalHandle);
          qrcodeDiv.innerHTML = `
            <div class="notification is-success">
              Thanks for your donation, you shold find your donation on the "Lateset dontions" table
            </div>
          `;
        }
      });
    }, 1000);
  }).catch(err => {
    if (err.response.status === 429) {
      alert('Too many request, only 3 requests allowed in 1 hour');
    }
  });
});

function renderTable() {
  function paymetsToContent(payments) {
    return payments
      .map((payment) => {
        const {
          address, name, url, txHash, value,
        } = payment;

        let txExploreUrl;
        if (address.startsWith('m') || address.startsWith('n')) {
          txExploreUrl = 'https://test-insight.bitpay.com/tx/';
        } else {
          txExploreUrl = 'https://insight.bitpay.com/tx/';
        }

        let nameTd;
        if (url) {
          nameTd = `<td> <a href="${url}"> ${name} </a></td>`;
        } else {
          nameTd = `<td>${name}</td>`;
        }

        return `
          <tr>
            ${nameTd}
            <td> ${value / 100000000} </td>
            <td> <a href="${txExploreUrl + txHash}"> ${txHash.slice(0, 3)}...${txHash.slice(-3)}</a></td>
          </tr>
        `;
      })
      .join('');
  }

  req.get('/payments', {
    params: {
      orderBy: 'createdAt',
      order: 'desc', // 'asc' or 'desc'
      limit: 5,
      offset: 0,
    },
  }).then((res) => {
    const payments = res.data;
    document.querySelector('.tbody-latest').innerHTML = paymetsToContent(payments);
  });

  req.get('/payments', {
    params: {
      orderBy: 'value',
      order: 'desc', // 'asc' or 'desc'
      limit: 5,
      offset: 0,
    },
  }).then((res) => {
    const payments = res.data;
    document.querySelector('.tbody-biggest').innerHTML = paymetsToContent(payments);
  });
}

renderTable();
