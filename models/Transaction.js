const { CURRENT_VERSION } = require('../rules');
const { utxos } = require("../db");


class Transaction {
    #version;
    #lockTime;
    #inputs;
    #outputs;

    constructor(inputs, outputs) {
        // Arrays of input and output UTXOs
        this.#version = CURRENT_VERSION;
        this.#lockTime = 0;
        this.#inputs = inputs;
        this.#outputs = outputs;
    }

    get version() { return this.#version; }
    get vin_sz() { return this.#inputs.length; }
    get vout_sz() { return this.#outputs.length; }
    get lock_time() { return this.#lockTime; }
    get inputs() { return this.#inputs; }
    get outputs() { return this.#outputs; }

    execute() {
        this.inputs.forEach((input) => {
            input.spent = true;
        });

        this.outputs.forEach((output) => {
            utxos.push(output);
        });
    }
}

class CoinbaseTransaction extends Transaction {
    constructor(outputs) {
        super([], outputs);
    }
}

module.exports = {
    Transaction,
    CoinbaseTransaction,
};