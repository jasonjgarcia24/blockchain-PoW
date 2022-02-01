const SHA256 = require('crypto-js/sha256');
const { verifySignatureWithoutPrivateKey } = require('../server/verify')
const { CURRENT_VERSION, RULES } = require('../rules');


class UTXO {
    #owner;

    constructor(owner) {
        this.#owner = SHA256(SHA256(owner)).toString();
        this.spent = false;
    }

    get owner() { return this.#owner; }
}

class InputUTXO extends UTXO {
    #signature;
    #message;
    #prevTxId;
    #prevOutputUTXOIndex;
    #scriptSig;

    constructor(recipient, signature, message, prevTxId, prevOutputUTXOIndex) {
        super(recipient);
        this.#signature = signature;
        this.#message = message;
        this.#prevTxId = prevTxId;
        this.#prevOutputUTXOIndex = prevOutputUTXOIndex;
        this.#scriptSig = `${signature.r} ${signature.s} ${recipient} ${message}`;
        this.unsafeScriptSig = this.#scriptSig;
    }

    get prevTxId() { return this.#prevTxId; }
    get prevOutputUTXOIndex() { return this.#prevOutputUTXOIndex; }

    get scriptSig() {
        /*
        * Unlocking Script
        *
        *   Provided by the sender.
        * 
        *   The scriptSig is contains the required signatures and the script which unlocks a
        *   UTXO for spending. A scriptSig pairs with the scriptPubKey (in OutputUTXO) to form
        *   a complete and valid script.
        * 
        *   When TKN is sent, it is locked using a scriptPubKey. The scriptPubKey can be thought
        *   as a riddle, solvable only by the owner of the correct private keys. To spend this
        *   TKN, the owner must publish the answer to the riddle by signing the transaction with
        *   their keys. The published answer to the riddle is the scriptSig: <sig> <pubKey>.
        * 
        *   Source: https://river.com/learn/terms/s/scriptsig/#:~:text=The%20ScriptSig%20is%20the%20part,present%20in%20legacy%20Bitcoin%20transactions.
        * 
        */

        return this.#scriptSig;
    }
}

class OutputUTXO extends UTXO {
    #amount;
    #signature;
    #message;

    constructor(owner, amount, signature, message) {
        super(owner);
        this.#amount = amount;
        this.#signature = signature;
        this.#message = message;
        this.unsafeMessage = message;
    }

    get amount() { return this.#amount; }
    get signature() { return this.#signature; }
    get message() { return this.#message; }

    scriptPubKey(recipientPubKey, signature, message) {
        /*
        * Locking Script
        *   Inputs:
        *       signatureObj - Signature object returned from  verifySignatureWithoutPrivateKey
        *       in verify.js.
        *           .message - Message sent in raw form.
        *           .signature - Signature of the message signed with the recipient's private key.
        *       recipientPubKey - Recipient's public key.
        *       hash - Provided by the sender. When TKN is sent to someone, the recipient's
        *       public key is hashed and provided in the transaction.
        * 
        *   Outputs:
        *       If (equalverify && checksig) === true, a scriptPubKey string will be returned.
        *       Otherwise, an empty string will be returned. The scriptPubKey is defined in rules.js.
        *       Ex: `OP_DUP OP_HASH256 ${senderPubKeyHash} OP_EQUALVERIFY OP_CHECKSIG`.
        * 
        */

        const dup = [recipientPubKey, recipientPubKey];
        const hash = SHA256(SHA256(dup[1])).toString();

        // SENDER VERIFICATION
        // For the recipient to receive the sent TKN, the recipient's hashed public key must
        // match the hashed public key sent from the sender.
        const equalverify = hash === this.owner;
        if (!equalverify) return '';

        // RECIPIENT VERIFICATION
        // The recipient has to sign the transaction with their private key. The signed message
        // has to then be decrypted with the recipient's public key.
        const checksig = verifySignatureWithoutPrivateKey(dup[0], signature, message);

        return checksig ? RULES[CURRENT_VERSION].SCRIPT_PUB_KEY_FUNC(this.owner) : '';
    }
}

module.exports = { InputUTXO, OutputUTXO };