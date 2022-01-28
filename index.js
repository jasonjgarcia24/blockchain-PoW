const mine = require('./mine');
const jayson = require('jayson')
const { PORT } = require('./config')


// Create server
const server = jayson.server({
    startMining: function (_, callback) {
        callback(null, 'success!');
    }
});

server.http().listen(PORT);
