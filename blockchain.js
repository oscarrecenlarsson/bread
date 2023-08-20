const sha256 = require("sha256");
const { v4: uuidv4 } = require("uuid");
// Class...
// Constructor function...
function Blockchain() {
  this.chain = [];
  this.pendingList = [];
  this.nodeUrl = process.argv[3];
  this.networkNodes = [];

  // Skapa genesis blocket...
  this.createBlock(1, "Genisis", "Genisis");
}

// Skapa ett block
Blockchain.prototype.createBlock = function (nonce, previousHash, hash) {
  const block = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    data: this.pendingList,
    nonce: nonce,
    hash: hash,
    previousHash: previousHash,
  };

  this.pendingList = [];
  this.chain.push(block);

  return block;
};

// Hämta senaste blocket...
Blockchain.prototype.getLastBlock = function () {
  return this.chain.at(-1);
};

Blockchain.prototype.createShipment = function (amount, sender, recipient) {
  const shipment = {
    amount,
    sender,
    recipient,
    shipmentId: uuidv4().split("-").join(""),
  };

  return shipment;
};

//funktion som adderar en transaktion till pendinglist
Blockchain.prototype.addTransactionToPendingList = function (transaction) {
  this.pendingList.push(transaction);
  return this.getLastBlock()["index"] + 1;
};

// Skapa ett hash värde...
Blockchain.prototype.createHash = function (prevHash, data, nonce) {
  const stringToHash = prevHash + JSON.stringify(data) + nonce.toString();
  const hash = sha256(stringToHash);
  return hash;
};

Blockchain.prototype.proofOfWork = function (prevHash, data) {
  let nonce = 0;
  let hash = this.createHash(prevHash, data, nonce);

  while (hash.substring(0, 4) !== "0000") {
    nonce++;
    hash = this.createHash(prevHash, data, nonce);
  }

  return nonce;
};

module.exports = Blockchain;
