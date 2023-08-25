const express = require("express");
const router = express.Router();
const axios = require("axios");
const {
  registerNetworkNodeAtNode,
  registerNetworkNodesAtNode,
  getFullNode,
} = require("../controllers/nodeController");
const {
  registerShipmentAtNode,
  SendShipmentToNextNode,
  getProcessAndSendShipmentById,
} = require("../controllers/shipmentController");
const {
  validateAndRegisterBlockAtNode,
} = require("../controllers/blockController");

// const logisticsBC = app.locals.logisticsBC;

module.exports = function (logisticsBC) {
  router.get("/", (req, res) => {
    getFullNode(logisticsBC, req, res);
  });

  router.post("/shipment", (req, res) => {
    registerShipmentAtNode(logisticsBC, req, res);
  });

  router.get("/shipments/shipment/:id", (req, res) => {
    getProcessAndSendShipmentById(logisticsBC, req, res);
  });

  router.patch("/shipments/shipment/:id", async (req, res) => {
    SendShipmentToNextNode(logisticsBC, req, res);
  });

  router.post("/block", (req, res) => {
    validateAndRegisterBlockAtNode(logisticsBC, req, res);
  });

  // Registrera enskild node
  router.post("/node", (req, res) => {
    registerNetworkNodeAtNode(logisticsBC, req, res);
  });

  // Registrera en lista med noder...
  router.post("/nodes", (req, res) => {
    registerNetworkNodesAtNode(logisticsBC, req, res);
  });

  return router;
};
