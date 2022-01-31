class Mempool {
    #transactions = [];

    get transactions() { return this.#transactions; }

    append(transaction) {
        this.#transactions.push(transaction);
    }

    splice(start, deleteCount = 1) {
        this.#transactions.splice(start, deleteCount);
    }
}

module.exports = Mempool;
