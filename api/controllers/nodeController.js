const axios = require("axios");

function getFullNode(logisticsNode, req, res) {
  res.status(200).json(logisticsNode);
}

async function createAndBroadcastNode(logisticsNode, req, res) {
  const nodeUrlToAdd = req.body.nodeUrl;
  //check if nodeUrlToAdd is already in this node's network list or is this nodes url
  if (
    logisticsNode.networkNodes.indexOf(nodeUrlToAdd) === -1 &&
    logisticsNode.nodeUrl !== nodeUrlToAdd
  ) {
    // add all network nodes, including this node's url, to the new node
    const body = {
      nodes: [...logisticsNode.networkNodes, logisticsNode.nodeUrl],
    };
    await axios.post(`${nodeUrlToAdd}/api/node/nodes`, body);

    // sync chain and pendingList to the new node
    const consensusPromise = axios.get(`${nodeUrlToAdd}/api/node/consensus`);

    // add new node to networkNodes list for all other nodes in the network
    const addNewNodeToOtherNodesPromises = logisticsNode.networkNodes.map(
      async (url) => {
        const body = { nodeUrl: nodeUrlToAdd };
        return axios.post(`${url}/api/node/node`, body);
      }
    );

    // add new node to networkNodes list at this node
    logisticsNode.networkNodes.push(nodeUrlToAdd);

    // resolve promises
    await Promise.all([consensusPromise, addNewNodeToOtherNodesPromises]);

    res
      .status(201)
      .json({ success: true, message: "New node added to the network" });
  } else {
    res.status(400).json({
      success: false,
      message: "Node already in network nodes or is this node's URL",
    });
  }
}

function registerNetworkNodeAtNode(logisticsNode, req, res) {
  // add node to networkNodes list as long as it is not already there
  // or the url matches the current nodes url

  const nodeUrlToAdd = req.body.nodeUrl;

  if (
    logisticsNode.networkNodes.indexOf(nodeUrlToAdd) === -1 &&
    logisticsNode.nodeUrl !== nodeUrlToAdd
  ) {
    logisticsNode.networkNodes.push(nodeUrlToAdd);
  }

  res
    .status(201)
    .json({ success: true, message: "New network node added at node" });
}

function registerNetworkNodesAtNode(logisticsNode, req, res) {
  // add nodes to networkNodes list as long as they are not already there
  // or any of the URLs matches the current nodes URL

  const allNodes = req.body.nodes;

  allNodes.forEach((url) => {
    if (
      logisticsNode.networkNodes.indexOf(url) === -1 &&
      logisticsNode.nodeUrl !== url
    ) {
      logisticsNode.networkNodes.push(url);
    }
  });

  res
    .status(201)
    .json({ success: true, message: "New network nodes added at node" });
}

async function synchronizeNode(logisticsNode, req, res) {
  const currentChainLength = logisticsNode.blockchain.chain.length;
  let maxLength = currentChainLength;
  let longestChain = null;
  let pendingList = null;

  logisticsNode.networkNodes.forEach(async (networkNodeUrl) => {
    // get the network node
    const response = await axios.get(`${networkNodeUrl}/api/node`);

    const NetworkChain = response.data.blockchain.chain;
    const NetworkPendingList = response.data.blockchain.pendingList;

    if (NetworkChain.length > maxLength) {
      maxLength = NetworkChain.length;
      longestChain = NetworkChain;
      pendingList = NetworkPendingList;
    }

    if (!longestChain) {
      console.log("No chain is longer than the current one");
    } else if (
      longestChain &&
      !logisticsNode.blockchain.validateChain(longestChain)
    ) {
      console.log("Longest chain is not valid");
    } else {
      logisticsNode.blockchain.chain = longestChain;
      logisticsNode.blockchain.pendingList = pendingList;
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
