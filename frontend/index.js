const paymentBtn = document.querySelector('.payment-btn');
const addrInput = document.querySelector('.addr-input');
const qrcodeDiv = document.getElementById('qrcode');
const qrcode = new QRCode(qrcodeDiv);

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

paymentBtn.addEventListener('click', async () => {
  const name = document.querySelector('.payment-name').value;
  const url = document.querySelector('.payment-url').value;
  const email = document.querySelector('.payment-email').value;

  // TODO: validate infos
  paramCheck({ name, url, email });
  const res = await axios.post('/askForPayment', {
    name,
    url,
    email,
  });

  const addr = res.data.address;
  const paymentId = res.data.id;
  qrcode.makeCode(`bitcoin:${addr}`);
  addrInput.value = addr;
  addrInput.style.display = 'block';

  // start pulling the address to see if value is updated
  const handle = setInterval(async () => {
    const addressCheckRes = await axios.get('/address', {
      params: {
        id: paymentId,
      },
    });

    const { value } = addressCheckRes.data;
    if (value) {
      renderTable();
      clearInterval(handle);
      qrcodeDiv.innerHTML = `
        <div class="notification is-success">
          Thanks for your donation, you shold find your donation on the "Lateset dontions" table
        </div>
      `;
    }
  }, 1000);
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
            <td> ${value} </td>
            <td> <a href="${txExploreUrl + txHash}"> ${txHash.slice(0, 3)}...${txHash.slice(-3)}</a></td>
          </tr>
        `;
      })
      .join('');
  }

  axios.get('/addresses', {
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

  axios.get('/addresses', {
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
