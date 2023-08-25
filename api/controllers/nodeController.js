const axios = require("axios");

function getFullNode(logisticsBC, req, res) {
  res.status(200).json(logisticsBC);
}

async function createAndBroadcastNode(logisticsBC, req, res) {
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
}

function registerNetworkNodeAtNode(logisticsBC, req, res) {
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
}

function registerNetworkNodesAtNode(logisticsBC, req, res) {
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
}

module.exports = {
  getFullNode,
  createAndBroadcastNode,
  registerNetworkNodeAtNode,
  registerNetworkNodesAtNode,
};
