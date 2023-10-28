import { v4 as uuidv4 } from "uuid";
import { Product, Waypoint } from "../interfaces/Shipment";
import BlockchainNode from "./BlockchainNode";

export default class Shipment {
  shipmentId: string;
  currentTime: string;
  route: Waypoint[]; //enum of farmer, mill, bakery and store?
  sender: Waypoint;
  currentLocation: Waypoint;
  destination: Waypoint; //enum of farmer, mill, bakery and store?
  delivered: boolean;
  products: Product[]; //product array
  //{productName:wheat, batchId:123}
  //{productName: flour, batchId:789, ingredients: [{productName: wheat, batchId: 123}]}

  constructor(
    logisticsNode: BlockchainNode,
    route: Waypoint[],
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

    function compareWaypoints(waypoint1: Waypoint, waypoint2: Waypoint) {
      return (
        waypoint1.nodeName === waypoint2.nodeName &&
        waypoint1.nodeUrl === waypoint2.nodeUrl
      );
    }

    if (
      compareWaypoints(shipment.route[nextLocationIndex], shipment.destination)
    ) {
      shipment.delivered = true;
    }

    // if (shipment.route[nextLocationIndex] === shipment.destination) {
    //   shipment.delivered = true;
    // }
    shipment.currentTime = new Date().toString();
    shipment.currentLocation = shipment.route[nextLocationIndex];

    return shipment;
  }
}

module.exports = Shipment;
