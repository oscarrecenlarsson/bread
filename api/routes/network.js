const axios = require("axios");
const express = require("express");
const router = express.Router();
const node = require("./node");
const {
  createAndBroadcastShipment,
  recieveAndBroadcastUpdatedShipment,
} = require("../controllers/shipmentController");
const { createAndBroadcastNode } = require("../controllers/nodeController");
const { mineBlock } = require("../controllers/blockController");

// const logisticsBC = require("../server").app.locals.logisticsBC;

module.exports = function (logisticsBC) {
  router.use("/api/node", node(logisticsBC));

  router.post("/node", async (req, res) => {
    await createAndBroadcastNode(logisticsBC, req, res);
  });

  router.post("/shipment", (req, res) => {
    createAndBroadcastShipment(logisticsBC, req, res);
  });

  //recieveAndBroadcastUpdatedShipment
  router.patch("/shipment", (req, res) => {
    recieveAndBroadcastUpdatedShipment(logisticsBC, req, res);
  });

  router.post("/block", async (req, res) => {
    mineBlock(logisticsBC, req, res);
  });

  return router;
};
