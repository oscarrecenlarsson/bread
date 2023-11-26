import { v4 as uuidv4 } from "uuid";
import { Product } from "../interfaces/Product";
import BlockchainNode from "./BlockchainNode";
import { NetworkNode } from "../interfaces/Node";
import { compareNetworkNodes } from "../../utils/compareNodes";

export default class Shipment {
  shipmentId: string;
  currentTime: string;
  route: NetworkNode[]; //enum of farmer, mill, bakery and store?
  sender: NetworkNode;
  currentLocation: NetworkNode;
  destination: NetworkNode; //enum of farmer, mill, bakery and store?
  delivered: boolean;
  products: Product[]; //product array
  //{productName:wheat, batchId:123}
  //{productName: flour, batchId:789, ingredients: [{productName: wheat, batchId: 123}]}

  constructor(
    logisticsNode: BlockchainNode,
    route: NetworkNode[],
    products: Product[]
  ) {
    const sender = {
      nodeName: logisticsNode.nodeName,
      nodeUrl: logisticsNode.nodeUrl,
    };
    this.shipmentId = uuidv4().split("-").join("");
    this.currentTime = new Date().toString();
    this.route = [sender, ...route];
    this.sender = sender;
    this.currentLocation = sender;
    this.destination = route[route.length - 1];
    this.delivered = false;
    this.products = products;
  }

  static update(shipment: Shipment) {
    console.log("Route", shipment.route);
    console.log("currentLocation", shipment.currentLocation);

    const currentLocationIndex = shipment.route.findIndex(
      (node) =>
        node.nodeName === shipment.currentLocation.nodeName &&
        node.nodeUrl === shipment.currentLocation.nodeUrl
    );

    const nextLocationIndex = currentLocationIndex + 1;

    if (
      compareNetworkNodes(
        shipment.route[nextLocationIndex],
        shipment.destination
      )
    ) {
      shipment.delivered = true;
    }

    shipment.currentTime = new Date().toString();
    shipment.currentLocation = shipment.route[nextLocationIndex];

    return shipment;
  }
}

module.exports = Shipment;
