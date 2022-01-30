require('dotenv').config();

const db = require('./db');
const { genAccountFromPrivateKey } = require('./client/generate');
const { getSignature } = require('./client/sign');
const Block = require('./models/Block');
const { Transaction, CoinbaseTransaction } = require('./models/Transaction');
const { InputUTXO, OutputUTXO } = require('./models/UTXO');

// const PUBLIC_KEY = process.env.PUBLIC_KEY;
const RECIPIENT_PRIVATE_KEY = process.env.PRIVATE_KEY_0;
const SENDER_PRIVATE_KEY = process.env.PRIVATE_KEY_1;
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

    const recipientKeyPair = genAccountFromPrivateKey(RECIPIENT_PRIVATE_KEY);
    const recipientPublicKey = recipientKeyPair.getPublic().encode('hex').toString();

    const block = new Block();

    // TODO: add transactions from the mempool

    const [_, coinbaseUTXO] = createUTXO(BLOCK_REWARD);
    console.log(coinbaseUTXO.scriptPubKey(
        _.message,
        _.signature,
        recipientPublicKey,
    ))

    const coinbaseTX = new CoinbaseTransaction([coinbaseUTXO]);

    block.addTransaction(coinbaseTX);

    while (!block.getBlockValidation()) { block.updateNonce(); }

    block.execute();
    db.blockchain.addBlock(block);

    console.log(`Block: ${db.blockchain.blockHeight().toString().padStart(3, 0)} -- Address: ${'0x' + block.address} -- Nonce: ${block.nonce}`);

    setTimeout(mine, 500);
}

function createUTXO(amount) {
    const senderKeyPair = genAccountFromPrivateKey(SENDER_PRIVATE_KEY);
    const recipientKeyPair = genAccountFromPrivateKey(RECIPIENT_PRIVATE_KEY);
    const senderPublicKey = senderKeyPair.getPublic().encode('hex').toString();
    const recipientPublicKey = recipientKeyPair.getPublic().encode('hex').toString();
    const signatureObj = getSignature(RECIPIENT_PRIVATE_KEY, senderPublicKey, amount);

    const inputUTXO = new InputUTXO(senderPublicKey, signatureObj.signature, signatureObj.message);
    const outputUTXO = new OutputUTXO(recipientPublicKey, amount);

    return [inputUTXO, outputUTXO];
}

module.exports = {
    startMining,
    stopMining
};