class Blockchain {
    constructor() {
        this.blocks = [];
    }

    addBlock(block) {
        this.blocks.push(block);
    }

    blockHeight() {
        return this.blocks.length;
    }

    findTransaction(hash) {
        
    }
}

module.exports = Blockchain;