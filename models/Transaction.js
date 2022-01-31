require('dotenv').config({ path: '../.env' });

const { genAccountFromPrivateKey } = require('../client/generate');
const { getSignature } = require('../client/sign');
const { InputUTXO, OutputUTXO } = require('../models/UTXO');
const { CURRENT_VERSION, RULES } = require('../rules');
const { utxos } = require("../server/db");

const RECIPIENT_PRIVATE_KEY = process.env.PRIVATE_KEY_0;
const SENDER_PRIVATE_KEY = process.env.PRIVATE_KEY_1;
const PUBLIC_KEY_MINER = process.env.PUBLIC_KEY_MINER;
const BLOCK_REWARD = RULES[CURRENT_VERSION].BLOCK_REWARD;
const FEE = RULES[CURRENT_VERSION].FEE;


class Transaction {
    #version;
    #lockTime;
    #inputs = [];
    #outputs = [];
    #fee;

    constructor() {
        // Arrays of input and output UTXOs
        this.#version = CURRENT_VERSION;
        this.#lockTime = 0;
        this.#inputs;
        this.#outputs;
        this.#fee = FEE;
    }

    get version() { return this.#version; }
    get vin_sz() { return this.#inputs.length; }
    get vout_sz() { return this.#outputs.length; }
    get lock_time() { return this.#lockTime; }
    get inputs() { return this.#inputs; }
    get outputs() { return this.#outputs; }
    get fee() { return this.#fee; }

    append() {
        let balance = 30;
        balance -= FEE;

        // Additional UTXO transactions    
        const recipientKeyPair = genAccountFromPrivateKey(RECIPIENT_PRIVATE_KEY);
        const recipientPublicKey = recipientKeyPair.getPublic().encode('hex').toString();

        // Coinbase UTXO
        this.#appendOutputUTXO(BLOCK_REWARD, PUBLIC_KEY_MINER);
        balance -= BLOCK_REWARD;

        this.#appendInputUTXO('0x0000');
        this.#appendOutputUTXO(balance, recipientPublicKey);
    }

    #appendInputUTXO(prevTxId) {
        const senderKeyPair = genAccountFromPrivateKey(SENDER_PRIVATE_KEY);
        const senderPublicKey = senderKeyPair.getPublic().encode('hex').toString();
        const signatureObj = getSignature(RECIPIENT_PRIVATE_KEY, senderPublicKey, prevTxId);

        const inputUTXO = new InputUTXO(senderPublicKey, signatureObj.signature, signatureObj.message);

        this.#inputs.push(inputUTXO);
    }

    #appendOutputUTXO(amount, recipientPublicKey) {
        const outputUTXO = new OutputUTXO(recipientPublicKey, amount);

        this.#outputs.push(outputUTXO);
    }

    execute() {
        this.#inputs.forEach((input) => {
            input.spent = true;
        });

        this.#outputs.forEach((output) => {
            utxos.push(output);
        });
    }
}

module.exports = Transaction;