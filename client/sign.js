const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');


const ec = new EC('secp256k1');

const getSignature = (recipientPrivateKey, senderPublicKey, ...data) => {
  const key = ec.keyFromPrivate(recipientPrivateKey);
  const recipientPublicKey = key.getPublic().encode('hex').toString();
  const recipientPublicKeyHash = SHA256(SHA256(recipientPublicKey));

  // To lock the message, we need to hash (SHA256) the message and sign/encrypt
  // with the private key.
  const message = salty() + `${senderPublicKey} ${JSON.stringify(data)} ${recipientPublicKeyHash}`;
  const msgHash = SHA256(message);
  const signature = key.sign(msgHash.toString());

  return {
    message,
    signature: {
      r: signature.r.toString(16),
      s: signature.s.toString(16)
    }
  };
}

const salty = (n) => {
  n = n || 16;
  var result = '';
  while (n--) {
    result += Math.floor(Math.random() * 16).toString(16).toLowerCase();
  }
  return result;
}

module.exports = { getSignature };