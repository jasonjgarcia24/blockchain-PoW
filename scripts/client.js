const jayson = require('jayson');
const { PORT } = require('../config');


// Create client
const client = jayson.client.http({
    port: PORT
});

module.exports = client