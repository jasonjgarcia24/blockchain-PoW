require('dotenv').config({ path: '../.env' });

const SHA256 = require('crypto-js/sha256');
const db = require('../server/db');
const { InputUTXO, OutputUTXO } = require('../models/UTXO');
const { CURRENT_VERSION, RULES } = require('../rules');

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
    get lockTime() { return this.#lockTime; }
    get inputs() { return this.#inputs; }
    get outputs() { return this.#outputs; }
    get fee() { return this.#fee; }

    get hash() {
        return SHA256(SHA256(
            '' +
            this.#version +
            this.#lockTime +
            JSON.stringify(this.#inputs) +
            JSON.stringify(this.#outputs) +
            this.#fee
        )).toString();
    }

    append(sender, recipient, balance, signature, message, prevTxId, prevOutputUTXOIndex) {
        balance -= FEE;

        if (!this.verifySender(sender, prevTxId, prevOutputUTXOIndex)) return;

        // Coinbase UTXO
        this.#appendOutputUTXO(
            PUBLIC_KEY_MINER,
            BLOCK_REWARD,
            undefined,
            undefined,
        );
        balance -= BLOCK_REWARD;

        // Sender/Recipient UTXOs
        this.#appendInputUTXO(
            sender,
            signature,
            message,
            prevTxId,
            prevOutputUTXOIndex,
        );

        this.#appendOutputUTXO(
            recipient,
            balance,
            signature,
            message,
        );

        prevOutputUTXOIndex = this.#outputs.length;
    }

    verifySender(sender, prevTxId, prevOutputUTXOIndex) {
        // Verify sender has access to funds
        let isVerified;
        let utxo;

        if (db.blockchain.blocks.length) {
            let prevOutputTx;
            db.blockchain.blocks.forEach((block) => {
                prevOutputTx = block.transactions.filter(transaction => transaction.hash === prevTxId)[0]
            })

            utxo = prevOutputTx.outputs[prevOutputUTXOIndex];
            isVerified = utxo.scriptPubKey(sender, utxo.signature, utxo.message);
            if (isVerified) console.log(isVerified);
        }
        else {
            isVerified = true;
        }

        return (isVerified) ? true : false;
    }

    verifyBalance() {
        
    }

    #appendInputUTXO(sender, signature, message, prevTxId, prevOutputUTXOIndex) {
        // Create Input UTXO
        const inputUTXO = new InputUTXO(
            sender,
            signature,
            message,
            prevTxId,
            prevOutputUTXOIndex
        );

        // const [rSignature, sSignature, owner, ...message] = inputUTXO.scriptSig.split(' ');

        this.#inputs.push(inputUTXO);
    }

    #appendOutputUTXO(recipientPublicKey, amount, signature, message) {
        const outputUTXO = new OutputUTXO(
            recipientPublicKey,
            amount,
            signature,
            message
        );

        this.#outputs.push(outputUTXO);
    }

    execute() {
        this.#inputs.forEach((input) => {
            input.spent = true;
        });
    }
}

module.exports = Transaction;