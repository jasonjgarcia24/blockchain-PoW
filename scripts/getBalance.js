require('dotenv').config({ path: '../.env' });
const client = require('./client');
const { parseParameters } = require('../utils/argv');

const PUBLIC_KEY = process.env.PUBLIC_KEY;

const [account] = parseParameters(process.argv);

console.log(account);

client.request('getBalance', [account], function (err, res) {
    if (err) throw err;
    console.log(res.result); // success!
})
