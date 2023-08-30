const axios = require("axios");

async function mineBlock(logisticsNode, req, res) {
  // mine block at node that got the call
  const block = logisticsNode.blockchain.mineBlock();

  // validate and register mined block at all of that nodes network nodes
  logisticsNode.networkNodes.forEach(async (url) => {
    await axios.post(`${url}/api/node/block`, { block: block });
  });

  res.status(200).json({
    success: true,
    data: block,
  });
}

function validateAndRegisterBlockAtNode(logisticsNode, req, res) {
  const block = req.body.block;
  const lastBlock = logisticsNode.blockchain.getLastBlock();

  if (logisticsNode.blockchain.validateBlock(block, lastBlock)) {
    logisticsNode.blockchain.chain.push(block);
    logisticsNode.blockchain.pendingList = [];

    res.status(201).json({ success: true, data: block });
  } else {
    res.status(400).json({
      success: false,
      errorMessage: "Blocket är inte godkänt",
      data: block,
    });
  }
}

module.exports = { mineBlock, validateAndRegisterBlockAtNode };
