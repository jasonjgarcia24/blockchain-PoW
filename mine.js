const db = require('./db');
const Block = require('./models/Block');
const TARGET_DIFFICULTY = BigInt('0x00000' + 'f'.repeat(60));


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
    while (BigInt('0x' + block.hash()) >= TARGET_DIFFICULTY) {
        block.nonce++;
    }

    db.blockchain.addBlock(block);
    console.log(`Block: ${db.blockchain.blockHeight().toString().padStart(3, 0)} -- Hash: ${'0x' + block.hash()} -- Nonce: ${block.nonce}`);

    setTimeout(mine, 500);
}

module.exports = {
    startMining,
    stopMining
};