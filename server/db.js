const Blockchain = require('../models/Blockchain');


// Init blockchain
const db = {
    blockchain: new Blockchain(),
    utxos: [],
}

module.exports = db;