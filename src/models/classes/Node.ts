import ShipmentInput from "../interfaces/Shipment";
import Blockchain from "./Blockchain";
import Shipment from "./Shipment";

export default class Node {
  blockchain: Blockchain;
  processAndSend: Shipment[];
  finalized: Shipment[];
  nodeUrl: string;
  nodeName: string;
  networkNodes: string[];

  constructor(nodeUrl, nodeName) {
    this.blockchain = new Blockchain();
    this.processAndSend = [];
    this.finalized = [];
    this.nodeUrl = nodeUrl;
    this.nodeName = nodeName; //enum names, farmer, mill, bakery, store?
    this.networkNodes = [];
  }

  createShipment(route, products) {
    //ShipmentInput
    const shipment = new Shipment({ route, products });
    this.addShipmentToPendingList(shipment);
    this.addShipmentToProcessAndSend(shipment);
    return shipment;
  }

  addShipmentToPendingList(shipment: Shipment) {
    this.blockchain.pendingList.push(shipment);
    return this.blockchain.getLastBlock()["index"] + 1;
  }

  addShipmentToProcessAndSend(shipment: Shipment) {
    this.processAndSend.push(shipment);
  }

  removeShipmentFromProcessAndSend(shipment: Shipment) {
    const index = this.processAndSend.indexOf(shipment);
    this.processAndSend.splice(index, 1);
  }

  addShipmentToFinalized(shipment: Shipment) {
    this.finalized.push(shipment);
  }
}
