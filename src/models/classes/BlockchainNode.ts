import { NetworkNode } from "../interfaces/Node";
import { Product, Waypoint } from "../interfaces/Shipment";
import Blockchain from "./Blockchain";
import Shipment from "./Shipment";

export default class BlockchainNode {
  blockchain: Blockchain;
  processAndSend: Shipment[];
  finalized: Shipment[];
  nodeUrl: string;
  nodeName: string;
  networkNodes: NetworkNode[];

  constructor(nodeUrl: string, nodeName: string) {
    this.blockchain = new Blockchain();
    this.processAndSend = [];
    this.finalized = [];
    this.nodeUrl = nodeUrl;
    this.nodeName = nodeName; //enum names, farmer, mill, bakery, store?
    this.networkNodes = [];
  }

  createShipment(
    logisticsNode: BlockchainNode,
    route: Waypoint[],
    products: Product[]
  ): Shipment {
    const shipment = new Shipment(logisticsNode, route, products);
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
    const ShipmentId = shipment.shipmentId;
    const ShipmentToRemove = this.processAndSend.find(
      (shipment) => shipment.shipmentId === ShipmentId
    );
    if (ShipmentToRemove) {
      const index = this.processAndSend.indexOf(ShipmentToRemove);
      this.processAndSend.splice(index, 1);
    }
  }

  addShipmentToFinalized(shipment: Shipment) {
    this.finalized.push(shipment);
  }
}
