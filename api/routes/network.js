const express = require("express");
const router = express.Router();
const node = require("./node");
const {
  createAndBroadcastShipment,
  recieveAndBroadcastUpdatedShipment,
} = require("../controllers/shipmentController");
const { createAndBroadcastNode } = require("../controllers/nodeController");
const { mineBlock } = require("../controllers/blockController");

module.exports = function (logisticsBC) {
  router.use("/api/node", node(logisticsBC));

  router.post("/node", async (req, res) => {
    await createAndBroadcastNode(logisticsBC, req, res);
  });

  router
    .route("/shipment")
    .post((req, res) => {
      createAndBroadcastShipment(logisticsBC, req, res);
    })
    .patch((req, res) => {
      recieveAndBroadcastUpdatedShipment(logisticsBC, req, res);
    });

  router.post("/block", async (req, res) => {
    mineBlock(logisticsBC, req, res);
  });
  return router;
};
