import { NetworkNode } from "../models/interfaces/Node";

export function compareNetworkNodes(
  networkNode1: NetworkNode,
  networkNode2: NetworkNode
): boolean {
  console.log("Comparing nodes:");
  console.log("Node 1:", networkNode1);
  console.log("Node 2:", networkNode2);

  return (
    networkNode1.nodeName === networkNode2.nodeName &&
    networkNode1.nodeUrl === networkNode2.nodeUrl
  );
}
