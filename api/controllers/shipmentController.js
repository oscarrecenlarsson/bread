const axios = require("axios");

function createAndBroadcastShipment(logisticsBC, req, res) {
  const shipment = logisticsBC.createShipment(
    req.body.route,
    req.body.products
  );

  // add shipment to relevant lists at node
  logisticsBC.addShipmentToPendingList(shipment);
  logisticsBC.addShipmentToProcessAndSend(shipment);

  // register shipment at all network nodes (pendingList)
  logisticsBC.networkNodes.forEach(async (url) => {
    await axios.post(`${url}/api/node/shipment`, shipment);
  });

  res.status(201).json({
    sucess: true,
    data: {
      shipmentId: shipment.shipmentId,
      currentLocation: shipment.currentLocation,
    },
    message: "Shipment has been created and broadcasted to the network",
  });
}

function registerShipmentAtNode(logisticsBC, req, res) {
  const shipment = req.body;
  const index = logisticsBC.addShipmentToPendingList(shipment);
  res.status(201).json({ success: true, data: index });
}

async function SendShipmentToNextNode(logisticsBC, req, res) {
  // get the shipment object by id
  const id = req.params["id"];
  const response = await axios.get(
    `${logisticsBC.nodeUrl}/api/node/shipments/shipment/${id}`
  );
  const shipment = response.data.data;

  logisticsBC.removeShipmentFromProcessAndSend(shipment);

  const updatedShipment = logisticsBC.updateShipment(shipment);

  const nextNodeUrl = updatedShipment.currentLocation;

  // the updated shipment is recieved at the next node
  // and then broadcasted to the network
  await axios.patch(`${nextNodeUrl}/api/network/shipment`, {
    updatedShipment: updatedShipment,
  });

  res.status(201).json({
    success: true,
    data: updatedShipment,
    message: "Shipment has been sent to next node",
  });
}

function recieveAndBroadcastUpdatedShipment(logisticsBC, req, res) {
  const shipment = req.body.updatedShipment;

  logisticsBC.addShipmentToPendingList(shipment);

  if (!shipment.delivered) {
    logisticsBC.addShipmentToProcessAndSend(shipment);
  } else {
    logisticsBC.addShipmentToFinalized(shipment);
  }

  // register updated shipment at all network nodes (pendingList)
  logisticsBC.networkNodes.forEach(async (url) => {
    await axios.post(`${url}/api/node/shipment`, shipment);
  });

  res.status(201).json({
    sucess: true,
    message: "shipment recieved at node and status broadcasted to the network",
  });
}

function getProcessAndSendShipmentById(logisticsBC, req, res) {
  const id = req.params["id"];
  const shipment = logisticsBC.processAndSend.find(
    (shipment) => shipment.shipmentId === id
  );
  res.status(201).json({ success: true, data: shipment });
}

module.exports = {
  createAndBroadcastShipment,
  registerShipmentAtNode,
  SendShipmentToNextNode,
  recieveAndBroadcastUpdatedShipment,
  getProcessAndSendShipmentById,
};
