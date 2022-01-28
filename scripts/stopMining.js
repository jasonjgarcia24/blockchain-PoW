const jayson = require('jayson');
const { PORT } = require('../config');


// Create client
const client = jayson.client.http({
    port: PORT
});

// invoke 'stopMining'
client.request('stopMining', [], function (err, res) {
    if (err) throw err;
    console.log(res.result); // stopping!
});
