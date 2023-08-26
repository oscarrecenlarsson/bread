const axios = require("axios");

function getFullNode(logisticsBC, req, res) {
  res.status(200).json(logisticsBC);
}

async function createAndBroadcastNode(logisticsBC, req, res) {
  // add new node to networkNodes list at current node
  const nodeUrlToAdd = req.body.nodeUrl;
  if (logisticsBC.networkNodes.indexOf(nodeUrlToAdd) === -1) {
    logisticsBC.networkNodes.push(nodeUrlToAdd);
  }
  // add new node to networkNodes list for all other nodes in the network
  logisticsBC.networkNodes.forEach(async (url) => {
    const body = { nodeUrl: nodeUrlToAdd };

    await axios.post(`${url}/api/node/node`, body);
  });
  // add all network nodes to the new node
  const body = { nodes: [...logisticsBC.networkNodes, logisticsBC.nodeUrl] };

  await axios.post(`${nodeUrlToAdd}/api/node/nodes`, body);

  // sync chain and pendingList to the new node
  await axios.get(`${nodeUrlToAdd}/api/node/consensus`);

  res
    .status(201)
    .json({ success: true, message: "New node added to the network" });
}

function registerNetworkNodeAtNode(logisticsBC, req, res) {
  // add node to networkNodes list as long as it is not already there
  // or the url matches the current nodes url

  const nodeUrlToAdd = req.body.nodeUrl;

  if (
    logisticsBC.networkNodes.indexOf(nodeUrlToAdd) === -1 &&
    logisticsBC.nodeUrl !== nodeUrlToAdd
  ) {
    logisticsBC.networkNodes.push(nodeUrlToAdd);
  }

  res
    .status(201)
    .json({ success: true, message: "New network node added at node" });
}

function registerNetworkNodesAtNode(logisticsBC, req, res) {
  // add nodes to networkNodes list as long as they are not already there
  // or any of the URLs matches the current nodes URL

  const allNodes = req.body.nodes;

  allNodes.forEach((url) => {
    if (
      logisticsBC.networkNodes.indexOf(url) === -1 &&
      logisticsBC.nodeUrl !== url
    ) {
      logisticsBC.networkNodes.push(url);
    }
  });

  res
    .status(201)
    .json({ success: true, message: "New network nodes added at node" });
}

async function synchronizeNode(logisticsBC, req, res) {
  const currentChainLength = logisticsBC.chain.length;
  let maxLength = currentChainLength;
  let longestChain = null;
  let pendingList = null;

  logisticsBC.networkNodes.forEach(async (networkNodeUrl) => {
    // get the network node
    const response = await axios.get(`${networkNodeUrl}/api/node`);

    const NetworkChain = response.data.chain;
    const NetworkPendingList = response.data.pendingList;

    if (NetworkChain.length > maxLength) {
      maxLength = NetworkChain.length;
      longestChain = NetworkChain;
      pendingList = NetworkPendingList;
    }

    if (
      !longestChain ||
      (longestChain && !logisticsBC.validateChain(longestChain))
    ) {
      console.log("No replacement needed");
    } else {
      logisticsBC.chain = longestChain;
      logisticsBC.pendingList = pendingList;
    }
  });
  res
    .status(200)
    .json({ success: true, message: "Node is synchronized and up to date" });
}

module.exports = {
  getFullNode,
  createAndBroadcastNode,
  registerNetworkNodeAtNode,
  registerNetworkNodesAtNode,
  synchronizeNode,
};
