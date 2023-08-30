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

module.exports = function (logisticsNode) {
  router.get("/", (req, res) => {
    getFullNode(logisticsNode, req, res);
  });

  router.post("/shipment", (req, res) => {
    registerShipmentAtNode(logisticsNode, req, res);
  });

  router
    .route("/shipments/shipment/:id")
    .get((req, res) => {
      getProcessAndSendShipmentById(logisticsNode, req, res);
    })
    .patch(async (req, res) => {
      await SendShipmentToNextNode(logisticsNode, req, res);
    });

  router.post("/block", (req, res) => {
    validateAndRegisterBlockAtNode(logisticsNode, req, res);
  });

  router.post("/node", (req, res) => {
    registerNetworkNodeAtNode(logisticsNode, req, res);
  });

  router.post("/nodes", (req, res) => {
    registerNetworkNodesAtNode(logisticsNode, req, res);
  });

  router.get("/consensus", async (req, res) => {
    await synchronizeNode(logisticsNode, req, res);
  });
  return router;
};
