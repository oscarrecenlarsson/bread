const express = require("express");
const { v4: uuidv4 } = require("uuid");

const Blockchain = require("./blockchain");
const { default: axios } = require("axios");
const app = express();

const softCoin = new Blockchain();

const PORT = process.argv[2];
const nodeAddress = uuidv4().split("-").join("");

// Middleware...
app.use(express.json());

app.get("/api/blockchain", (req, res) => {
  res.status(200).json(softCoin);
});

app.post("/api/transaction/broadcast", (req, res) => {
  //skapa en ny transaction på aktuell node
  const transaction = softCoin.addTransaction(
    req.body.amount,
    req.body.sender,
    req.body.recipient
  );
  //Lägg till nya transaktioner till aktuell node
  softCoin.addTransactionToPendingList(transaction);

  //iterera igenom alla nätverksnoder i networkNodes och nropa reskpektive och skcika över den nya transaktionen
  // behöver vi använda axios för att göra ett post anrop
  //await axios.post(url,body)

  //anropa api/transaction för alla network nodes

  softCoin.networkNodes.forEach(async (url) => {
    // const body = { transaction: transaction };

    await axios.post(`${url}/api/transaction`, transaction);
  });

  res
    .status(201)
    .json({ sucess: true, data: "transaktion är skapad och uppdaterad" });
});

app.post("/api/transaction", (req, res) => {
  //hämta ut transatktionsobjektet ifrån body i request objektet
  const transaction = req.body;
  const index = softCoin.addTransactionToPendingList(transaction);
  res.status(201).json({ success: true, data: index });
});

app.get("/api/mine", async (req, res) => {
  const previousBlock = softCoin.getLastBlock();
  const previousHash = previousBlock.hash;
  const data = {
    data: softCoin.pendingList,
    index: previousBlock.index + 1,
  };
  const nonce = softCoin.proofOfWork(previousHash, data);
  const hash = softCoin.createHash(previousHash, data, nonce);

  // softCoin.addTransaction(6.25, "00", nodeAddress);

  const block = softCoin.createBlock(nonce, previousHash, hash);

  softCoin.networkNodes.forEach(async (url) => {
    // anropa en endpoint vi ska kalla api/block som tar argument i body vårt nya block

    await axios.post(`${url}/api/block`, { block: block });
  });

  await axios.post(`${softCoin.nodeUrl}/api/transaction/broadcast`, {
    amount: 6.25,
    sender: "00",
    recipient: nodeAddress,
  });

  res.status(200).json({
    success: true,
    data: block,
  });
});

app.post("/api/block", (req, res) => {
  const block = req.body.block;
  const lastBlock = softCoin.getLastBlock();
  const hashIsCorrect = lastBlock.hash === block.previousHash;
  const hasCorrectIndex = lastBlock.index + 1 === block.index;

  if (hashIsCorrect && hasCorrectIndex) {
    softCoin.chain.push(block);
    softCoin.pendingList = [];

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

  if (softCoin.networkNodes.indexOf(urlToAdd) === -1) {
    softCoin.networkNodes.push(urlToAdd);
  }
  // 2. Iterera igenom vår networkNodes lista och skicka till varje node
  // i listan samma nya node
  softCoin.networkNodes.forEach(async (url) => {
    const body = { nodeUrl: urlToAdd };

    await axios.post(`${url}/api/node/node`, body);
  });
  // 3. Uppdatera nya noden med samma noder som vi har i nätverket...
  const body = { nodes: [...softCoin.networkNodes, softCoin.nodeUrl] };

  await axios.post(`${urlToAdd}/api/node/nodes`, body);

  res.status(201).json({ success: true, data: "Ny nod tillagd i nätverket." });
});

// Registrera enskild node
app.post("/api/node/node", (req, res) => {
  // Få in en nodes unika adress(URL)...
  const url = req.body.nodeUrl; //http://localhost:3001
  // Kontrollera att vi inte redan har registrerat denna URL...
  // Om inte registrera, dvs placera noden i vår networkNode lista...
  if (softCoin.networkNodes.indexOf(url) === -1 && softCoin.nodeUrl !== url) {
    softCoin.networkNodes.push(url);
  }

  res.status(201).json({ success: true, data: "Ny nod tillagd" });
});

// Registrera en lista med noder...
app.post("/api/node/nodes", (req, res) => {
  const allNodes = req.body.nodes;

  allNodes.forEach((url) => {
    if (softCoin.networkNodes.indexOf(url) === -1 && softCoin.nodeUrl !== url) {
      softCoin.networkNodes.push(url);
    }
  });

  res.status(201).json({ success: true, data: "Nya noder tillagda" });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
