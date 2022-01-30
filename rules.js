module.exports = {
    CURRENT_VERSION: '00.00.01',
    RULES: {
        '00.00.01': {
            HEADER: {
                BLOCK_DIFFICULTY: BigInt('0x00000' + 'f'.repeat(60)),
            },
            BLOCK_REWARD: 10,
            FEE: 0.1,
            SCRIPT_PUB_KEY_FUNC: (senderPubKeyHash) => { return `OP_DUP OP_HASH256 ${senderPubKeyHash} OP_EQUALVERIFY OP_CHECKSIG` }
        }
    },
};