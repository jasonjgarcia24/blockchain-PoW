const db = require('./db');
const Block = require('./models/Block');


// Mine blocks
function mine() {
    db.blockchain.addBlock(new Block());
    console.log(`Just mined block ${db.blockchain.blockHeight()}`);

    setTimeout(mine, 1000);
}

module.exports = mine;