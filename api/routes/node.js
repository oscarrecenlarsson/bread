const express = require("express");
const router = express.Router();
const axios = require("axios");
const {
  registerNodeAtNode,
  registerNodesAtNode,
  getFullNode,
} = require("../controllers/nodeController");
const { createShipmentAtNode } = require("../controllers/shipmentController");

// const logisticsBC = app.locals.logisticsBC;

module.exports = function (logisticsBC) {
  router.get("/", (req, res) => {
    getFullNode(logisticsBC, req, res);
  });

  router.post("/shipment", (req, res) => {
    createShipmentAtNode(logisticsBC, req, res);
  });

  router.get("/shipments/shipment/:id", (req, res) => {
    const id = req.params["id"];
    const shipment = logisticsBC.processAndSend.find(
      (shipment) => shipment.shipmentId === id
    );
    res.status(201).json({ success: true, data: shipment });
  });

  router.patch("/shipments/shipment/:id", async (req, res) => {
    const id = req.params["id"];
    const response = await axios.get(
      `${logisticsBC.nodeUrl}/api/node/shipments/shipment/${id}`
    );

    const shipment = response.data.data;

    logisticsBC.removeShipmentFromProcessAndSend(shipment);

    const updatedShipment = logisticsBC.updateShipment(shipment);

    const url = updatedShipment.currentLocation;

    await axios.patch(`${url}/api/network/shipment`, {
      updatedShipment: updatedShipment,
    });

    res.status(201).json({ success: true, data: updatedShipment });
  });

  router.post("/block", (req, res) => {
    const block = req.body.block;
    const lastBlock = logisticsBC.getLastBlock();
    const hashIsCorrect = lastBlock.hash === block.previousHash;
    const hasCorrectIndex = lastBlock.index + 1 === block.index;

    if (hashIsCorrect && hasCorrectIndex) {
      logisticsBC.chain.push(block);
      logisticsBC.pendingList = [];

      res.status(201).json({ success: true, data: block });
    } else {
      res.status(400).json({
        success: false,
        errorMessage: "Blocket är inte godkänt",
        data: block,
      });
    }
  });

  // Registrera enskild node
  router.post("/node", (req, res) => {
    registerNodeAtNode(logisticsBC, req, res);
  });

  // Registrera en lista med noder...
  router.post("/nodes", (req, res) => {
    registerNodesAtNode(logisticsBC, req, res);
  });

  return router;
};
