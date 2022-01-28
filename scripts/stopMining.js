const client = require('./client');


// invoke 'stopMining'
client.request('stopMining', [], function (err, res) {
    if (err) throw err;
    console.log(res.result); // stopping!
});
