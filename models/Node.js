const Blockchain = require("./Blockchain");
const Shipment = require("./Shipment");
class Node {
  constructor() {
    this.blockchain = new Blockchain();
    this.processAndSend = [];
    this.finalized = [];
    this.nodeUrl = process.argv[3];
    this.networkNodes = [];
  }

  createShipment(route, products) {
    const shipment = new Shipment(route, products);
    this.addShipmentToPendingList(shipment);
    this.addShipmentToProcessAndSend(shipment);
    return shipment;
  }

  addShipmentToPendingList(shipment) {
    this.blockchain.pendingList.push(shipment);
    return this.blockchain.getLastBlock()["index"] + 1;
  }

  addShipmentToProcessAndSend(shipment) {
    this.processAndSend.push(shipment);
  }

  removeShipmentFromProcessAndSend(shipment) {
    const index = this.processAndSend.indexOf(shipment);
    this.processAndSend.splice(index, 1);
  }

  addShipmentToFinalized(shipment) {
    this.finalized.push(shipment);
  }
}

module.exports = Node;
