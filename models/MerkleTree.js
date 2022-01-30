class MerkleTree {
    constructor(leaves, concat) {
        this.leaves = leaves;
        this.concat = concat;
    }

    getRoot() {
        if (this.leaves.length === 1) { return this.leaves }

        let leaves = this.leaves;

        while (leaves.length !== 1) {
            for (let i = 1; i <= leaves.length; i += 1) {
                if (leaves[i]) {
                    leaves[i - 1] = this.concat(leaves[i - 1], leaves[i]);
                    leaves.splice(i, 1);
                }
            }
        }
        return leaves[0]
    }

    getProof(index) {
        let leavesLength;
        let leaves = this.leaves;
        let proof = [];

        while (leaves.length !== 1) {
            // Even index --> Go right
            if (index % 2 === 0) {
                if (leaves[index + 1]) proof.push({ data: leaves[index + 1], left: false });
            }
            // Odd index --> Go left
            else {
                if (leaves[index - 1]) proof.push({ data: leaves[index - 1], left: true });
            }
            index = Math.floor(index / 2);

            // Hash remaining leaves
            leavesLength = leaves.length;
            for (let i = 1; i <= leavesLength; i += 1) {
                if (leaves[i]) {
                    leaves[i - 1] = this.concat(leaves[i - 1], leaves[i]);
                    leaves.splice(i, 1);
                }
            }
        }

        return proof;
    }
}

module.exports = MerkleTree;