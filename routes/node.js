const express = require("express");
const router = express.Router();

// const logisticsBC = app.locals.logisticsBC;

router.post("/api/node/shipment", (req, res) => {
  //hämta ut transatktionsobjektet ifrån body i request objektet
  const shipment = req.body;
  const index = logisticsBC.addShipmentToPendingList(shipment);
  res.status(201).json({ success: true, data: index });
});

router.post("/api/node/shipments/shipment/:id", async (req, res) => {
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

router.get("/api/node/shipments/shipment/:id", (req, res) => {
  const id = req.params["id"];
  const shipment = logisticsBC.processAndSend.find(
    (shipment) => shipment.shipmentId === id
  );
  res.status(201).json({ success: true, data: shipment });
});

router.post("/api/node/block", (req, res) => {
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
router.post("/api/node/node", (req, res) => {
  // Få in en nodes unika adress(URL)...
  const url = req.body.nodeUrl; //http://localhost:3001
  // Kontrollera att vi inte redan har registrerat denna URL...
  // Om inte registrera, dvs placera noden i vår networkNode lista...
  if (
    logisticsBC.networkNodes.indexOf(url) === -1 &&
    logisticsBC.nodeUrl !== url
  ) {
    logisticsBC.networkNodes.push(url);
  }

  res.status(201).json({ success: true, data: "Ny nod tillagd" });
});

// Registrera en lista med noder...
router.post("/api/node/nodes", (req, res) => {
  const allNodes = req.body.nodes;

  allNodes.forEach((url) => {
    if (
      logisticsBC.networkNodes.indexOf(url) === -1 &&
      logisticsBC.nodeUrl !== url
    ) {
      logisticsBC.networkNodes.push(url);
    }
  });

  res.status(201).json({ success: true, data: "Nya noder tillagda" });
});

module.exports = router;
