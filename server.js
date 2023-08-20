const express = require("express");
const { v4: uuidv4 } = require("uuid");

const Blockchain = require("./blockchain");
const { default: axios } = require("axios");
const app = express();

const logisticsBC = new Blockchain();

const PORT = process.argv[2];
const nodeAddress = uuidv4().split("-").join("");

// Middleware...
app.use(express.json());

app.get("/api/blockchain", (req, res) => {
  res.status(200).json(logisticsBC);
});

app.post("/api/network/shipment", (req, res) => {
  //skapa en ny transaction på aktuell node
  const shipment = logisticsBC.createShipment(
    req.body.route,
    req.body.products
  );
  //Lägg till nya transaktioner till aktuell node
  logisticsBC.addShipmentToPendingList(shipment);

  //iterera igenom alla nätverksnoder i networkNodes och nropa reskpektive och skcika över den nya transaktionen
  // behöver vi använda axios för att göra ett post anrop
  //await axios.post(url,body)

  //anropa api/transaction för alla network nodes

  logisticsBC.networkNodes.forEach(async (url) => {
    // const body = { transaction: transaction };

    await axios.post(`${url}/api/node/shipment`, shipment);
  });

  res.status(201).json({
    sucess: true,
    data: "shipment has been created and broadcasted to the network",
  });
});

app.post("/api/node/shipment", (req, res) => {
  //hämta ut transatktionsobjektet ifrån body i request objektet
  const shipment = req.body;
  const index = logisticsBC.addShipmentToPendingList(shipment);
  res.status(201).json({ success: true, data: index });
});

app.post("/api/node/shipments/shipment/:id", (req, res) => {
  const id = req.params["id"];

  res.status(201).json({ success: true, data: id });
});

app.get("/api/mine", async (req, res) => {
  const previousBlock = logisticsBC.getLastBlock();
  const previousHash = previousBlock.hash;
  const data = {
    data: logisticsBC.pendingList,
    index: previousBlock.index + 1,
  };
  const nonce = logisticsBC.proofOfWork(previousHash, data);
  const hash = logisticsBC.createHash(previousHash, data, nonce);

  // logisticsBC.addTransaction(6.25, "00", nodeAddress);

  const block = logisticsBC.createBlock(nonce, previousHash, hash);

  logisticsBC.networkNodes.forEach(async (url) => {
    // anropa en endpoint vi ska kalla api/block som tar argument i body vårt nya block

    await axios.post(`${url}/api/block`, { block: block });
  });

  // no mining reward required
  // await axios.post(`${logisticsBC.nodeUrl}/api/network/shipment`, {
  //   amount: 6.25,
  //   sender: "00",
  //   recipient: nodeAddress,
  // });

  res.status(200).json({
    success: true,
    data: block,
  });
});

app.post("/api/block", (req, res) => {
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

/* ----------------------------------------------------------------------------------------- */
/* Administrativa endpoints... */
/* ----------------------------------------------------------------------------------------- */

// Add a new node to the network...
app.post("/api/network/node", async (req, res) => {
  // 1. Placera nya noden i aktuell nodes networkNodes lista...
  const urlToAdd = req.body.nodeUrl;

  if (logisticsBC.networkNodes.indexOf(urlToAdd) === -1) {
    logisticsBC.networkNodes.push(urlToAdd);
  }
  // 2. Iterera igenom vår networkNodes lista och skicka till varje node
  // i listan samma nya node
  logisticsBC.networkNodes.forEach(async (url) => {
    const body = { nodeUrl: urlToAdd };

    await axios.post(`${url}/api/node/node`, body);
  });
  // 3. Uppdatera nya noden med samma noder som vi har i nätverket...
  const body = { nodes: [...logisticsBC.networkNodes, logisticsBC.nodeUrl] };

  await axios.post(`${urlToAdd}/api/node/nodes`, body);

  res.status(201).json({ success: true, data: "Ny nod tillagd i nätverket." });
});

// Registrera enskild node
app.post("/api/node/node", (req, res) => {
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
app.post("/api/node/nodes", (req, res) => {
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

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
