const { startMining, stopMining } = require('../mine');
const jayson = require('jayson')
const { utxos } = require('./db');
const { PORT } = require('../config')


// Create server
const server = jayson.server({
    startMining: function (_, callback) {
        callback(null, 'success!');
        startMining();
    },

    stopMining: function (_, callback) {
        stopMining();
        callback(null, 'stopped!')
    },

    getBalance: function ([address], callback) {
        const ourUTXOs = utxos.filter(x => x && x.owner === address && !x.spent);
        const sum = ourUTXOs.reduce((prev, curr) => prev + curr.amount, 0);

        callback(null, `Sum: ${sum}`);
    }
});

server.http().listen(PORT);
