require('dotenv').config();

const db = require('./server/db');
const { genAccountFromPrivateKey } = require('./client/generate');
const Block = require('./models/Block');
const Transaction = require('./models/Transaction');
const Mempool = require('./models/mempool');


let mining = true;
let mempool = new Mempool();
startMining();

function startMining() {
    mining = true;
    mine();
}

function stopMining() {
    if (!mining) return;
    mining = false;
    mempool = new Mempool();
    console.log('Mining stopped.');
}

// Mine blocks
function mine() {
    if (!mining) return;

    let tx;

    while (mempool.transactions.length < 4) {
        tx = new Transaction();
        tx.append()
        mempool.append(tx)
    }
    mempool.transactions.forEach(tx => {
        tx.inputs.forEach(utxo => {
            console.log(utxo.prevTxId)
        })
    })

    const block = new Block()
    block.addTransaction(mempool.transactions);
    mempool.splice(0, 4);

    while (!block.getBlockValidation()) { block.updateNonce(); }

    block.execute();
    db.blockchain.addBlock(block);

    console.log(`Block: ${db.blockchain.blockHeight().toString().padStart(3, 0)} -- Address: ${'0x' + block.address} -- Nonce: ${block.nonce}`);

    setTimeout(mine, 500);
}

module.exports = {
    startMining,
    stopMining
};