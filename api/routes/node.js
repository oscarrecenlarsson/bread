const express = require("express");
const router = express.Router();

const {
  registerNetworkNodeAtNode,
  registerNetworkNodesAtNode,
  getFullNode,
  synchronizeNode,
} = require("../controllers/nodeController");
const {
  registerShipmentAtNode,
  SendShipmentToNextNode,
  getProcessAndSendShipmentById,
} = require("../controllers/shipmentController");
const {
  validateAndRegisterBlockAtNode,
} = require("../controllers/blockController");

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

  router.post("/node", (req, res) => {
    registerNetworkNodeAtNode(logisticsBC, req, res);
  });

  router.post("/nodes", (req, res) => {
    registerNetworkNodesAtNode(logisticsBC, req, res);
  });

  router.get("/consensus", (req, res) => {
    synchronizeNode(logisticsBC, req, res);
  });
  return router;
};
