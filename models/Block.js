const SHA256 = require('crypto-js/sha256');
const { CURRENT_VERSION, RULES } = require('../rules');

const BLOCK_DIFFICULTY = RULES[CURRENT_VERSION].HEADER.BLOCK_DIFFICULTY;


class BlockHeader {
    #version;
    #prevBlockHash;
    #merkleRoot;
    #timestamp;
    #difficulty;
    #nonce;

    constructor(prevBlockHash, merkleRoot) {
        this.#version = CURRENT_VERSION;
        this.#prevBlockHash = prevBlockHash;
        this.#merkleRoot = merkleRoot;
        this.#timestamp = Date.now();
        this.#difficulty = BLOCK_DIFFICULTY;
        this.#nonce = 0;
    }

    get version() { return this.#version; }
    get prevBlockHash() { return this.#prevBlockHash; }
    get merkleRoot() { return this.#merkleRoot; }
    get timestamp() { return this.#timestamp; }
    get difficulty() { return this.#difficulty; }
    get nonce() { return this.#nonce; }

    updateNonce() {
        this.#nonce++;
    }
}

class Block extends BlockHeader {
    #transactions;

    constructor(prevBlockHash, merkleRoot) {
        super(prevBlockHash, merkleRoot);
        this.#transactions = [];
    }

    get transactions() { return this.#transactions; }

    get hash() {
        // SHA256 does weird things with concat'd numbers.
        // Need to add '' at the front to "instruct" concatenation
        // to string.
        return SHA256(
            '' +
            this.timestamp +
            this.nonce +
            JSON.stringify(this.#transactions)
        ).toString();
    }

    get address() {
        return SHA256(
            this.hash
        ).toString();
    }

    getBlockValidation() {
        return BigInt('0x' + this.hash) <= this.difficulty;
    }

    addTransaction(transactions) {
        transactions.forEach(tx => this.#transactions.push(tx));
    }

    execute() {
        if (this.getBlockValidation()) {
            this.#transactions.forEach(x => x.execute());
        }
        else {
            throw new Error("Invalid attempt to add block to transactions!\n\n  --> Block.getBlockValidation() === false\n")
        }
    }
}

module.exports = Block;