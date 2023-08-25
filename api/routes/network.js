const axios = require("axios");
const express = require("express");
const router = express.Router();
const node = require("./node");
const {
  createAndBroadcastShipment,
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

  router.patch("/shipment", (req, res) => {
    //skapa en ny transaction på aktuell node
    //behöver jag göra om denna för att det ska fungera med "move"????

    //if body har ett helt shipmentobject sett shipment till det annars skapa en ny shipment:
    // console.log("body", req.body);

    const shipment = req.body.updatedShipment;

    //Lägg till nya transaktioner till aktuell node
    logisticsBC.addShipmentToPendingList(shipment);

    if (!shipment.delivered) {
      logisticsBC.addShipmentToProcessAndSend(shipment);
    } else {
      logisticsBC.addShipmentToFinalized(shipment);
    }

    //iterera igenom alla nätverksnoder i networkNodes och nropa reskpektive och skcika över den nya transaktionen
    // behöver vi använda axios för att göra ett post anrop
    //await axios.post(url,body)

    //anropa api/transaction för alla network nodes

    logisticsBC.networkNodes.forEach(async (url) => {
      await axios.post(`${url}/api/node/shipment`, shipment);
    });

    res.status(201).json({
      sucess: true,
      data: "shipment has been created and broadcasted to the network",
    });
  });

  router.post("/block", async (req, res) => {
    mineBlock(logisticsBC, req, res);
  });

  return router;
};
