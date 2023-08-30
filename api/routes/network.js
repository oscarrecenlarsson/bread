const express = require("express");
const router = express.Router();
const node = require("./node");
const {
  createAndBroadcastShipment,
  recieveAndBroadcastUpdatedShipment,
} = require("../controllers/shipmentController");
const { createAndBroadcastNode } = require("../controllers/nodeController");
const { mineAndBroadcastBlock } = require("../controllers/blockController");

module.exports = function (logisticsNode) {
  router.use("/api/node", node(logisticsNode));

  router.post("/node", async (req, res) => {
    await createAndBroadcastNode(logisticsNode, req, res);
  });

  router
    .route("/shipment")
    .post(async (req, res) => {
      await createAndBroadcastShipment(logisticsNode, req, res);
    })
    .patch(async (req, res) => {
      await recieveAndBroadcastUpdatedShipment(logisticsNode, req, res);
    });

  router.post("/block", async (req, res) => {
    await mineAndBroadcastBlock(logisticsNode, req, res);
  });
  return router;
};
