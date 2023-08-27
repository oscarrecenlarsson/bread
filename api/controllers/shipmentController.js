const axios = require("axios");

function createAndBroadcastShipment(logisticsNode, req, res) {
  const shipment = logisticsNode.blockchain.createShipment(
    req.body.route,
    req.body.products
  );

  // add shipment to relevant lists at node
  logisticsNode.addShipmentToPendingList(shipment);
  logisticsNode.addShipmentToProcessAndSend(shipment);

  // register shipment at all network nodes (pendingList)
  logisticsNode.networkNodes.forEach(async (url) => {
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

function registerShipmentAtNode(logisticsNode, req, res) {
  const shipment = req.body;
  const index = logisticsNode.addShipmentToPendingList(shipment);
  res.status(201).json({ success: true, data: index });
}

async function SendShipmentToNextNode(logisticsNode, req, res) {
  // get the shipment object by id
  const id = req.params["id"];
  const response = await axios.get(
    `${logisticsNode.nodeUrl}/api/node/shipments/shipment/${id}`
  );
  const shipment = response.data.data;

  logisticsNode.removeShipmentFromProcessAndSend(shipment);

  const updatedShipment = logisticsNode.blockchain.updateShipment(shipment);

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

function recieveAndBroadcastUpdatedShipment(logisticsNode, req, res) {
  const shipment = req.body.updatedShipment;

  logisticsNode.addShipmentToPendingList(shipment);

  if (!shipment.delivered) {
    logisticsNode.addShipmentToProcessAndSend(shipment);
  } else {
    logisticsNode.addShipmentToFinalized(shipment);
  }

  // register updated shipment at all network nodes (pendingList)
  logisticsNode.networkNodes.forEach(async (url) => {
    await axios.post(`${url}/api/node/shipment`, shipment);
  });

  res.status(201).json({
    sucess: true,
    message: "shipment recieved at node and status broadcasted to the network",
  });
}

function getProcessAndSendShipmentById(logisticsNode, req, res) {
  const id = req.params["id"];
  const shipment = logisticsNode.processAndSend.find(
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
