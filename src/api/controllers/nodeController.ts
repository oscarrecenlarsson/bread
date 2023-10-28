import { Request, Response } from "express";
import axios from "axios";
import BlockchainNode from "../../models/classes/BlockchainNode";
import { NetworkNode } from "../../models/interfaces/Node";
import { compareNetworkNodes } from "../../utils/compareNodes";
//import NodeCall from "../../models/interfaces/Api";

function getFullNode(
  logisticsNode: BlockchainNode,
  req: Request,
  res: Response
) {
  res.status(200).json(logisticsNode);
}

async function createAndBroadcastNode(
  logisticsNode: BlockchainNode,
  req: Request,
  res: Response
) {
  const networkNodeToAdd = req.body as NetworkNode;

  //check if networkNode is already in this node's network list or is this node

  console.log("createAndBroadcastNode");

  let exists = false;
  for (const networkNode of logisticsNode.networkNodes) {
    exists = compareNetworkNodes(networkNode, networkNodeToAdd);
  }

  if (
    !exists &&
    networkNodeToAdd.nodeName !== logisticsNode.nodeName &&
    networkNodeToAdd.nodeUrl !== logisticsNode.nodeUrl
  ) {
    // add all network nodes, including this node's url, to the new node
    const nodeName = logisticsNode.nodeName;
    const nodeUrl = logisticsNode.nodeUrl;
    const thisNode = { nodeName, nodeUrl };
    const body = {
      nodes: [...logisticsNode.networkNodes, thisNode],
    };

    console.log("BOOOODY", body);

    try {
      await axios.post(`${networkNodeToAdd.nodeUrl}/api/node/nodes`, body);

      // sync chain and pendingList to the new node
      const consensusPromise = axios.get(
        `${networkNodeToAdd.nodeUrl}/api/node/consensus`
      );

      // add new node to networkNodes list for all other nodes in the network
      const addNewNodeToOtherNodesPromises = logisticsNode.networkNodes.map(
        async (networkNode) => {
          const body = networkNodeToAdd;
          return axios.post(`${networkNode.nodeUrl}/api/node/node`, body);
        }
      );

      // resolve promises
      await Promise.all([consensusPromise, addNewNodeToOtherNodesPromises]);

      // add new node to networkNodes list at this node
      logisticsNode.networkNodes.push(networkNodeToAdd);

      res
        .status(201)
        .json({ success: true, message: "New node added to the network" });
    } catch (error) {
      console.error(error); //can't log error.stack
      res.status(500).json({
        success: false,
        errorMessage: "An error occurred creating and broadcasting the node.",
      });
    }
  } else {
    res.status(400).json({
      success: false,
      message: "Node already in network nodes or is this node's URL",
    });
  }
}

function registerNetworkNodeAtNode(
  logisticsNode: BlockchainNode,
  req: Request,
  res: Response
) {
  // add node to networkNodes list as long as it is not already there
  // or the url matches the current nodes url

  const networkNodeToAdd = req.body;

  console.log("LOOK HERE", networkNodeToAdd);

  console.log("registerNetworkNodeAtNode");

  let exists = false;
  for (const networkNode of logisticsNode.networkNodes) {
    exists = compareNetworkNodes(networkNode, networkNodeToAdd);
  }

  if (
    !exists &&
    networkNodeToAdd.nodeName !== logisticsNode.nodeName &&
    networkNodeToAdd.nodeUrl !== logisticsNode.nodeUrl
  ) {
    logisticsNode.networkNodes.push(networkNodeToAdd);
  }

  res
    .status(201)
    .json({ success: true, message: "New network node added at node" });
}

function registerNetworkNodesAtNode(
  logisticsNode: BlockchainNode,
  req: Request,
  res: Response
) {
  // add nodes to networkNodes list as long as they are not already there
  // or any of the URLs matches the current nodes URL

  const allNodes = req.body.nodes;

  console.log("registerNetworkNodesAtNode");

  allNodes.forEach((networkNodeToAdd: NetworkNode) => {
    let exists = false;
    for (const networkNode of logisticsNode.networkNodes) {
      exists = compareNetworkNodes(networkNode, networkNodeToAdd);
    }

    if (
      !exists &&
      networkNodeToAdd.nodeName !== logisticsNode.nodeName &&
      networkNodeToAdd.nodeUrl !== logisticsNode.nodeUrl
    ) {
      logisticsNode.networkNodes.push(networkNodeToAdd);
    }
  });
  res
    .status(201)
    .json({ success: true, message: "New network nodes added at node" });
}

async function synchronizeNode(
  logisticsNode: BlockchainNode,
  req: Request,
  res: Response
) {
  const currentChainLength = logisticsNode.blockchain.chain.length;
  let maxLength = currentChainLength;
  let longestChain = null;
  let pendingList = null;

  try {
    for (const networkNode of logisticsNode.networkNodes) {
      // get the network node and set relevant variables based on that node
      const response = await axios.get(`${networkNode.nodeUrl}/api/node`);
      const NetworkChain = response.data.blockchain.chain;
      const NetworkPendingList = response.data.blockchain.pendingList;

      // check if the network node has a longer chain than the node we want to sync
      if (NetworkChain.length > maxLength) {
        maxLength = NetworkChain.length;
        longestChain = NetworkChain;
        pendingList = NetworkPendingList;
      }

      if (!longestChain) {
        console.log("The network chain is not longer than the current one");
      } else if (
        // if so, check if it is valid
        longestChain &&
        !logisticsNode.blockchain.validateChain(longestChain)
      ) {
        console.log("The network chain is longer but is not valid");
      } else {
        // the network node's chain is longer and valid so the node we want to sync is updated
        logisticsNode.blockchain.chain = longestChain;
        logisticsNode.blockchain.pendingList = pendingList;
      }
    }
    res
      .status(200)
      .json({ success: true, message: "Node is synchronized and up to date" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errorMessage: "An error occurred trying to synchronize the node.",
    });
  }
}

export {
  getFullNode,
  createAndBroadcastNode,
  registerNetworkNodeAtNode,
  registerNetworkNodesAtNode,
  synchronizeNode,
};
