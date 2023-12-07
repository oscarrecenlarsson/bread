import axios from "axios";
import Shipment from "../../models/classes/Shipment";
import { Request, Response } from "express";
import BlockchainNode from "../../models/classes/BlockchainNode";
import { Product } from "../../models/interfaces/Product";

async function createAndBroadcastShipment(
  logisticsNode: BlockchainNode,
  req: Request,
  res: Response
) {
  const shipment = logisticsNode.createShipment(
    logisticsNode,
    req.body.route,
    req.body.products
  );

  console.log(shipment);

  try {
    // register shipment at all network nodes (pendingList)
    await Promise.all(
      logisticsNode.networkNodes.map(async (networkNode) => {
        axios.post(`${networkNode.nodeUrl}/api/node/shipment`, shipment);
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
    console.error(error);
    res.status(500).json({
      success: false,
      errorMessage: "An error occurred creating and broadcasting the shipment.",
    });
  }
}

function registerShipmentAtNode(
  logisticsNode: BlockchainNode,
  req: Request,
  res: Response
) {
  const shipment = req.body;
  const index = logisticsNode.addShipmentToPendingList(shipment);
  res.status(201).json({ success: true, data: index });
}

async function SendShipmentToNextNode(
  logisticsNode: BlockchainNode,
  req: Request,
  res: Response
) {
  // get the shipment object by id
  const id = req.params["id"];

  try {
    const response = await axios.get(
      `${logisticsNode.nodeUrl}/api/node/shipments/shipment/${id}`
    );

    const shipment = response.data.data; //NOT INSTANCE OF SHIPMENT

    logisticsNode.removeShipmentFromProcessAndSend(shipment);

    const updatedShipment = Shipment.update(shipment);

    const nextNodeUrl = updatedShipment.currentLocation.nodeUrl;

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
    console.error(error);
    res.status(500).json({
      success: false,
      errorMessage: "An error occurred sending the shipment to the next node.",
    });
  }
}

async function recieveAndBroadcastUpdatedShipment(
  logisticsNode: BlockchainNode,
  req: Request,
  res: Response
) {
  const shipment = req.body.updatedShipment;
  try {
    // register updated shipment at all network nodes (pendingList)
    await Promise.all(
      logisticsNode.networkNodes.map(async (networkNode) => {
        axios.post(`${networkNode.nodeUrl}/api/node/shipment`, shipment);
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
    console.error(error);
    res.status(500).json({
      success: false,
      errorMessage:
        "An error occurred receiving broadcasting the updated shipment to the network.",
    });
  }
}

function getProcessAndSendShipmentById(
  logisticsNode: BlockchainNode,
  req: Request,
  res: Response
) {
  const id = req.params["id"];
  const shipment = logisticsNode.processAndSend.find(
    (shipment: Shipment) => shipment.shipmentId === id
  );
  res.status(200).json({ success: true, data: shipment });
}

function getProductByQrCode(
  logisticsNode: BlockchainNode,
  req: Request,
  res: Response
) {
  const qrCode = req.params["qrCode"];
  console.log("QRCODE", qrCode);

  let result = undefined;

  for (const shipment of logisticsNode.finalized) {
    result = shipment.products.find((product) => product.qrCode === qrCode);
    if (result !== undefined) {
      break;
    }
  }

  if (result === undefined) {
    res.status(404).json({
      success: false,
      message: `No product not found with the provided QR code: ${qrCode}`,
    });
    return;
  }

  res.status(200).json({ success: true, data: result });
}

export {
  createAndBroadcastShipment,
  registerShipmentAtNode,
  SendShipmentToNextNode,
  recieveAndBroadcastUpdatedShipment,
  getProcessAndSendShipmentById,
  getProductByQrCode,
};
