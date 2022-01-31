require('dotenv').config();

const SHA256 = require('crypto-js/sha256');
const db = require('./server/db');
const { genAccountFromPrivateKey } = require('./client/generate');
const Block = require('./models/Block');
const Transaction = require('./models/Transaction');
const Mempool = require('./models/mempool');

let mining;
let mempool;
let prevBlockHash;
let merkleRoot;


startMining();

function setDefaults() {
    mining = true;
    mempool = new Mempool();
    prevBlockHash = '0'.repeat(64);
    merkleRoot = 'f'.repeat(64);
}

function startMining() {
    setDefaults()
    mine();
}

function stopMining() {
    if (!mining) return;
    mining = false;
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

    // mempool.transactions.forEach(tx => {
    //     tx.outputs.forEach(utxo => {
    //         console.log(utxo.scriptPubKey())
    //     })
    // })

    const block = new Block(prevBlockHash, merkleRoot)
    block.addTransaction(mempool.transactions);
    mempool.splice(0, 4);

    while (!block.getBlockValidation()) { block.updateNonce(); }
    prevBlockHash = block.hash;

    block.execute();
    db.blockchain.addBlock(block);
    db.utxos.push(block.transactions.outputs)

    console.log(`Block: ${db.blockchain.blockHeight().toString().padStart(3, 0)} -- Address: ${'0x' + block.address} -- Nonce: ${block.nonce}`);

    setTimeout(mine, 50000);
}

module.exports = {
    startMining,
    stopMining
};