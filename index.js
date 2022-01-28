const Block = require('./models/Block');
const Blockchain = require('./models/Blockchain');
const jayson = require('jayson')
const { SERVER_PORT } = require('./config')


// Create server
const server = jayson.server({
    add: function (args, callback) {
        callback(null, args[0] + args[1]);
    }
});

server.http().listen(SERVER_PORT);

// Init blockchain
const db = {
    blockchain: new Blockchain()
}

// Mine blocks
function mine() {
    db.blockchain.addBlock(new Block());
    console.log(`Just mined block ${db.blockchain.blockHeight()}`);

    setTimeout(mine, 1000);
}

mine();