const client = require('./client');


// invoke 'startMining'
client.request('startMining', [], function (err, res) {
    if (err) throw err;
    console.log(res.result); // success!
});