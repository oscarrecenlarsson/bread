import { v4 as uuidv4 } from "uuid";
import ShipmentInput from "../interfaces/Shipment";

export default class Shipment {
  shipmentId: string;
  currentTime: string;
  route: string[]; //enum of farmer, mill, bakery and store?
  sender: string;
  currentLocation: string;
  destination: string; //enum of farmer, mill, bakery and store?
  delivered: boolean;
  products: string[]; //product array
  //{productName:wheat, batchId:123}
  //{productName: flour, batchId:789, ingredients: [{productName: wheat, batchId: 123}]}

  constructor({ route, products }: ShipmentInput) {
    this.shipmentId = uuidv4().split("-").join("");
    this.currentTime = new Date().toString();
    this.route = route;
    this.sender = route[0];
    this.currentLocation = route[0];
    this.destination = route[route.length - 1];
    this.delivered = false;
    this.products = products;
  }

  static update(shipment: Shipment) {
    const nextLocationIndex =
      shipment.route.indexOf(shipment.currentLocation) + 1;

    if (shipment.route[nextLocationIndex] === shipment.destination) {
      shipment.delivered = true;
    }
    shipment.currentTime = new Date().toString();
    shipment.currentLocation = shipment.route[nextLocationIndex];

    return shipment;
  }
}

module.exports = Shipment;
