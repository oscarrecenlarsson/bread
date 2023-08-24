const axios = require("axios");

function createAndBroadcastShipment(logisticsBC, req, res) {
  //skapa en ny transaction på aktuell node
  //behöver jag göra om denna för att det ska fungera med "move"????

  //if body har ett helt shipmentobject sett shipment till det annars skapa en ny shipment:
  // console.log(req.body);

  const shipment = logisticsBC.createShipment(
    req.body.route,
    req.body.products
  );

  //Lägg till nya transaktioner till aktuell node
  logisticsBC.addShipmentToPendingList(shipment);

  logisticsBC.addShipmentToProcessAndSend(shipment);

  //iterera igenom alla nätverksnoder i networkNodes och nropa reskpektive och skcika över den nya transaktionen
  // behöver vi använda axios för att göra ett post anrop
  //await axios.post(url,body)

  //anropa api/transaction för alla network nodes

  logisticsBC.networkNodes.forEach(async (url) => {
    // const body = { transaction: transaction };

    await axios.post(`${url}/api/node/shipment`, shipment);
  });

  res.status(201).json({
    sucess: true,
    data: {
      shipmentId: shipment.shipmentId,
      currentLocation: shipment.currentLocation,
    },
    message: "shipment has been created and broadcasted to the network",
  });
}

module.exports = { createAndBroadcastShipment };