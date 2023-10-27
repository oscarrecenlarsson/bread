import { Request, Response } from "express";
import Node from "../../models/classes/Node";
//import NodeCall from "../../models/interfaces/Api";

import axios from "axios";
import { logisticsNode } from "../../server";

async function mineAndBroadcastBlock(
  logisticsNode: Node,
  req: Request,
  res: Response
) {
  // mine block at node that got the call
  console.log("MINE BLOCK IS RUNNING");

  const block = logisticsNode.blockchain.mineBlock();

  try {
    // validate and register mined block at all of that nodes network nodes
    await Promise.all(
      logisticsNode.networkNodes.map(async (url: string) => {
        return axios.post(`${url}/api/node/block`, { block: block });
      })
    );

    res.status(200).json({
      success: true,
      message: "Block has been mined and registered at all network nodes",
      data: block,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errorMessage:
        "An error occurred registering the block to the network nodes.",
    });
  }
}

function validateAndRegisterBlockAtNode(
  logisticsNode: Node,
  req: Request,
  res: Response
) {
  const block = req.body.block;
  const lastBlock = logisticsNode.blockchain.getLastBlock();

  if (logisticsNode.blockchain.validateBlock(block, lastBlock)) {
    logisticsNode.blockchain.chain.push(block);
    logisticsNode.blockchain.pendingList = [];

    res.status(201).json({ success: true, data: block });
  } else {
    res.status(400).json({
      success: false,
      errorMessage: "The block is not valid",
      data: block,
    });
  }
}

export { mineAndBroadcastBlock, validateAndRegisterBlockAtNode };
