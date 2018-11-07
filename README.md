## Landing page and sample usage of [Cryptoo](https://github.com/getcryptoo/cryptoo)

## Work through the soure code

### Backend
Backend code can be found in the `backend` folder

`server.js` is the entry, it contains an express server exposing 3 APIs
  - `/askForPayment`: store donator info to database and create a bitcoin address for user
  - `payments`: query existed payments
  - `/payment`: query one payment with id, frontend can call this api repeatedly to verify if payment is done. The payment detail will be updated when user send some coins to the address. The payment detail update logic is in `cryptoo.js`
- `cryptoo.js` initialize the Cryptoo instance, handle transaction events. When new `tx` arrived, it will update the records in database

### Database
For simplisity, this example use `sqlite` as the sql database to record donations, the database table definitaion can be found in the `tools` folder `tools/initDb.sql`.

### Frontend
Frontend code can be found in the `frontend` folder.
Frontend is making use of [axios](https://github.com/axios/axios) to call the APIs and then render the page.

## Clone this repo and play with the example youself

1. clone this repo
2. `npm install`: install dependencies
5. `npm run initDb`: this will create a `db.sqlite` file in the current folder
6. modify `bitcoinNetwork` to `testnet` in `backend/config.js` if you are testing and want to use `testnet` bitcoin
7. `npm run start`: start the backend
8. visit `http://localhost:7777`