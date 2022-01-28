const jayson = require('jayson');
const { PORT } = require('../config');


// Create client
const client = jayson.client.http({
    port: PORT
});

// invoke 'startMining'
client.request('startMining', [], function (err, res) {
    if (err) throw err;
    console.log(res.result); // success!
});