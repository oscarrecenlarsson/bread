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

  update(currentLocation) {
    if (
      this.route.indexOf(currentLocation) + 1 ===
      this.route.indexOf(this.destination)
    ) {
      this.delivered = true;
    }
    this.currentLocation = currentLocation;
  }
}

module.exports = Shipment;
