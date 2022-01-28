const { startMining, stopMining } = require('./mine');
const jayson = require('jayson')
const { PORT } = require('./config')


// Create server
const server = jayson.server({
    startMining: function (_, callback) {
        callback(null, 'success!');
        startMining();
    },

    stopMining: function (_, callback) {
        stopMining();
        callback(null, 'stopped!')
    }
});

server.http().listen(PORT);
