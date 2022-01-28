require('dotenv').config();

const db = require('./db');
const Block = require('./models/Block');
const Transaction = require('./models/Transaction');
const UTXO = require('./models/UTXO');
const TARGET_DIFFICULTY = BigInt('0x00000' + 'f'.repeat(60));

const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const BLOCK_REWARD = 10;


let mining = true;
mine();

function startMining() {
    if (mining) return;
    mining = true;
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

    const block = new Block();

    // TODO: add transactions from the mempool

    const coinbaseUTXO = new UTXO(PUBLIC_KEY, BLOCK_REWARD);
    const coinbaseTX = new Transaction([], [coinbaseUTXO]);
    block.addTransaction(coinbaseTX);

    while (BigInt('0x' + block.hash()) >= TARGET_DIFFICULTY) {
        block.nonce++;
    }

    block.execute();

    console.log(block.transactions[0])

    db.blockchain.addBlock(block);
    console.log(`Block: ${db.blockchain.blockHeight().toString().padStart(3, 0)} -- Hash: ${'0x' + block.hash()} -- Nonce: ${block.nonce}`);

    setTimeout(mine, 500);
}

module.exports = {
    startMining,
    stopMining
};