require('dotenv').config();

const SHA256 = require('crypto-js/sha256');
const db = require('./server/db');
const { genAccountFromPrivateKey } = require('./client/generate');
const { getSignature } = require('./client/sign');
const Block = require('./models/Block');
const Transaction = require('./models/Transaction');
const Mempool = require('./models/mempool');

const PUBLIC_KEY_MINER = process.env.PUBLIC_KEY_MINER;
const SENDER_PRIVATE_KEY = process.env.PRIVATE_KEY_1;
const RECIPIENT_PRIVATE_KEY = process.env.PRIVATE_KEY_0;
const TARGET_MEMPOOL_LENGTH = 1;

let mining;
let mempool;
let prevBlockHash;
let merkleRoot;

let transaction;
let BALANCE;
let prevTxId;
let prevOutputUTXOIndex;


startMining();

function setDefaults() {
    mining = true;
    mempool = new Mempool();
    prevBlockHash = '0'.repeat(64);
    merkleRoot = 'f'.repeat(64);

    BALANCE = 30;
    prevTxId = [];
    prevOutputUTXOIndex = [];
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

    let thisUTXO;

    const senderKeyPair = genAccountFromPrivateKey(RECIPIENT_PRIVATE_KEY);
    const recipientKeyPair = genAccountFromPrivateKey(RECIPIENT_PRIVATE_KEY);

    const senderPublicKey = senderKeyPair.getPublic().encode('hex').toString();
    const recipientPublicKey = recipientKeyPair.getPublic().encode('hex').toString();

    // Get previous output UTXOs for this address
    db.blockchain.blocks.forEach((block) => {
        block.transactions.forEach((transaction) => {
            transaction.outputs.forEach((utxo, i) => {
                if (utxo && utxo.owner === SHA256(SHA256(recipientPublicKey)).toString()) {
                    BALANCE = utxo.amount;
                    prevOutputUTXOIndex.push(i);
                    thisUTXO = utxo;
                }
            })
        })
    })

    const signatureObj = getSignature(
        RECIPIENT_PRIVATE_KEY,
        senderPublicKey,
        prevTxId[prevTxId.length - 1],
        prevOutputUTXOIndex[prevOutputUTXOIndex.length - 1]
    );

    transaction = new Transaction();

    transaction.append(
        senderPublicKey,
        recipientPublicKey,
        BALANCE,
        signatureObj.signature,
        signatureObj.message,
        prevTxId[prevTxId.length - 1],
        prevOutputUTXOIndex[prevOutputUTXOIndex.length - 1]
    );

    mempool.append(transaction)

    const block = new Block(prevBlockHash, merkleRoot)
    block.addTransaction(mempool.transactions);
    mempool.splice(0, TARGET_MEMPOOL_LENGTH);

    while (!block.getBlockValidation()) { block.updateNonce(); }

    block.execute();
    db.blockchain.addBlock(block);

    console.log(`Block: ${db.blockchain.blockHeight().toString().padStart(3, 0)} -- Address: ${'0x' + block.address} -- Nonce: ${block.nonce}`);

    prevBlockHash = block.hash;
    prevTxId.push(transaction.hash);
    prevOutputUTXOIndex = [];

    setTimeout(mine, 200000);
}

module.exports = {
    startMining,
    stopMining
};