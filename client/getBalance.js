require('dotenv').config({ path: '../.env' });

const SHA256 = require('crypto-js/sha256');
const client = require('./client');
const { parseParameters } = require('../utils/argv');

const PUBLIC_KEY = process.env.PUBLIC_KEY_0;

let [account] = parseParameters(process.argv);
account = account ? account : PUBLIC_KEY;
account = SHA256(SHA256(account)).toString();

console.log(account);

client.request('getBalance', [account], function (err, res) {
    if (err) throw err;
    console.log(res.result); // success!
})
