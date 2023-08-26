const sha256 = require("sha256");
const { v4: uuidv4 } = require("uuid");
// Class...
// Constructor function...
function Blockchain() {
  this.chain = [];
  this.pendingList = [];
  this.processAndSend = [];
  this.finalized = [];
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

Blockchain.prototype.createShipment = function (route, products) {
  const shipment = {
    shipmentId: uuidv4().split("-").join(""),
    currentTime: new Date().toString(),
    route,
    sender: route[0],
    currentLocation: route[0],
    destination: route[route.length - 1],
    delivered: false,
    products,
  };

  return shipment;
};

Blockchain.prototype.updateShipment = function (shipment) {
  let finalized = false;

  if (
    shipment.route[shipment.route.indexOf(shipment.currentLocation) + 1] ===
    shipment.destination
  ) {
    finalized = true;
  }

  const updatedShipment = {
    shipmentId: shipment.shipmentId,
    currentTime: new Date().toString(),
    route: shipment.route,
    sender: shipment.sender,
    currentLocation:
      shipment.route[shipment.route.indexOf(shipment.currentLocation) + 1],
    destination: shipment.destination,
    delivered: finalized,
    products: shipment.products,
  };

  return updatedShipment;
};
// Blockchain.prototype.sendShipment = function (shipment) {
//   // ta bort shipment från this.processAndSend
// }

//funktion som adderar en transaktion till pendinglist
Blockchain.prototype.addShipmentToPendingList = function (shipment) {
  this.pendingList.push(shipment);
  return this.getLastBlock()["index"] + 1;
};

Blockchain.prototype.addShipmentToProcessAndSend = function (shipment) {
  this.processAndSend.push(shipment);
};

// Blockchain.prototype.addShipmentToProcessAndSendAtNextNode = function (shipment) {
//   this.processAndSend.push(shipment);
// };

Blockchain.prototype.removeShipmentFromProcessAndSend = function (shipment) {
  const index = this.processAndSend.indexOf(shipment);
  this.processAndSend.splice(index, 1);
};

Blockchain.prototype.addShipmentToFinalized = function (shipment) {
  this.finalized.push(shipment);
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

Blockchain.prototype.validateChain = function (blockChain) {
  let isValid = true;

  for (i = 1; i < blockChain.length; i++) {
    const block = blockChain[i];
    const previousBlock = blockChain[i - 1];
    const hash = this.createHash(
      previousBlock.hash,
      { data: block.data, index: block.index },
      block.nonce
    );

    if (hash !== block.hash) {
      isValid = false;
    }

    if (block.previousHash !== previousBlock.hash) {
      isValid = false;
    }
  }

  // Validera genisis blocket...
  const genesisBlock = blockChain.at(0);
  const isGenesisNonceValid = genesisBlock.nonce === 1;
  const isGenesisHashValid = genesisBlock.hash === "Genisis";
  const isGenesisPreviousHashValid = genesisBlock.previousHash === "Genisis";
  const hasNoData = genesisBlock.data.length === 0;

  if (
    !isGenesisNonceValid ||
    !isGenesisHashValid ||
    !isGenesisPreviousHashValid ||
    !hasNoData
  ) {
    isValid = false;
  }

  return isValid;
};

module.exports = Blockchain;
