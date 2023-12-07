import BlockchainNode from "../models/classes/BlockchainNode";
import { NetworkNode } from "../models/interfaces/Node";

export function compareNetworkNodes(
  networkNode1: NetworkNode,
  networkNode2: NetworkNode
): boolean {
  return (
    networkNode1.nodeName === networkNode2.nodeName &&
    networkNode1.nodeUrl === networkNode2.nodeUrl
  );
}

export function existsInNetworkNodes(
  logisticsNode: BlockchainNode,
  networkNodeToAdd: NetworkNode
): boolean {
  let existsInNetworkNodes = false;
  for (const networkNode of logisticsNode.networkNodes) {
    existsInNetworkNodes = compareNetworkNodes(networkNode, networkNodeToAdd);
    if (existsInNetworkNodes) {
      return existsInNetworkNodes;
    }
  }
  return existsInNetworkNodes;
}

export function isThisNode(
  logisticsNode: BlockchainNode,
  networkNodeToAdd: NetworkNode
): boolean {
  return (
    networkNodeToAdd.nodeName === logisticsNode.nodeName &&
    networkNodeToAdd.nodeUrl === logisticsNode.nodeUrl
  );
}

export function isThisNodeOrExistsInNetworkNodes(
  logisticsNode: BlockchainNode,
  networkNodeToAdd: NetworkNode
): boolean {
  return (
    isThisNode(logisticsNode, networkNodeToAdd) ||
    existsInNetworkNodes(logisticsNode, networkNodeToAdd)
  );
}
