const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');

const ec = new EC('secp256k1');

// To verify, we need to send the message and hash (SHA256) it.
// Then decrypt the signature with the public key to return the received hash.
// And then compare the hashed original message with the decrypted hash.
const verifySignature = (key, signature, message) => {
  const msgHash = SHA256(message).toString();

  return key.verify(msgHash, signature);
}

const verifySignatureWithoutPrivateKey = (pubPoint, signature, message) => {
  const key = ec.keyFromPublic(pubPoint, 'hex');

  const msgHash = SHA256(message).toString();
  const results = key.verify(msgHash, signature);

  return results;
}

module.exports = { verifySignature, verifySignatureWithoutPrivateKey }