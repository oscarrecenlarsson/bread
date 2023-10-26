import axios from "axios";
import Shipment from "../../models/Shipment";

async function createAndBroadcastShipment(logisticsNode, req, res) {
  const shipment = logisticsNode.createShipment(
    req.body.route,
    req.body.products
  );

  console.log(shipment);

  try {
    // register shipment at all network nodes (pendingList)
    await Promise.all(
      logisticsNode.networkNodes.map(async (url) => {
        axios.post(`${url}/api/node/shipment`, shipment);
      })
    );

    res.status(201).json({
      sucess: true,
      data: {
        shipmentId: shipment.shipmentId,
        currentLocation: shipment.currentLocation,
      },
      message: "Shipment has been created and broadcasted to the network",
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({
      success: false,
      errorMessage: "An error occurred creating and broadcasting the shipment.",
    });
  }
}

function registerShipmentAtNode(logisticsNode, req, res) {
  const shipment = req.body;
  const index = logisticsNode.addShipmentToPendingList(shipment);
  res.status(201).json({ success: true, data: index });
}

async function SendShipmentToNextNode(logisticsNode, req, res) {
  // get the shipment object by id
  const id = req.params["id"];

  try {
    const response = await axios.get(
      `${logisticsNode.nodeUrl}/api/node/shipments/shipment/${id}`
    );
    const shipment = response.data.data; //NOT INSTANCE OF SHIPMENT

    logisticsNode.removeShipmentFromProcessAndSend(shipment);

    const updatedShipment = Shipment.update(shipment);

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
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({
      success: false,
      errorMessage: "An error occurred sending the shipment to the next node.",
    });
  }
}

async function recieveAndBroadcastUpdatedShipment(logisticsNode, req, res) {
  const shipment = req.body.updatedShipment;
  try {
    // register updated shipment at all network nodes (pendingList)
    await Promise.all(
      logisticsNode.networkNodes.map(async (url) => {
        axios.post(`${url}/api/node/shipment`, shipment);
      })
    );

    logisticsNode.addShipmentToPendingList(shipment);

    if (!shipment.delivered) {
      logisticsNode.addShipmentToProcessAndSend(shipment);
    } else {
      logisticsNode.addShipmentToFinalized(shipment);
    }
    res.status(201).json({
      sucess: true,
      message:
        "shipment recieved at node and status broadcasted to the network",
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({
      success: false,
      errorMessage:
        "An error occurred receiving broadcasting the updated shipment to the network.",
    });
  }
}

function getProcessAndSendShipmentById(logisticsNode, req, res) {
  const id = req.params["id"];
  const shipment = logisticsNode.processAndSend.find(
    (shipment) => shipment.shipmentId === id
  );
  res.status(201).json({ success: true, data: shipment });
}

export {
  createAndBroadcastShipment,
  registerShipmentAtNode,
  SendShipmentToNextNode,
  recieveAndBroadcastUpdatedShipment,
  getProcessAndSendShipmentById,
};
