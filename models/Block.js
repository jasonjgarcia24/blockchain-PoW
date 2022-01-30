const SHA256 = require('crypto-js/sha256');
const BlockHeader = require('./BlockHeader');


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

    addTransaction(tx) {
        this.#transactions.push(tx);
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