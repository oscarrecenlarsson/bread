const { v4: uuidv4 } = require("uuid");

class Shipment {
  constructor(route, products) {
    this.shipmentId = uuidv4().split("-").join("");
    this.currentTime = new Date().toString();
    this.route = route;
    this.sender = route[0];
    this.currentLocation = route[0];
    this.destination = route[route.length - 1];
    this.delivered = false;
    this.products = products;
  }

  static update(shipment) {
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
