const Blockchain = require('../models/Blockchain');


// Init blockchain
const db = {
    blockchain: new Blockchain(),
}

module.exports = db;