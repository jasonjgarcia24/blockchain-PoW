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

module.exports = BlockHeader;