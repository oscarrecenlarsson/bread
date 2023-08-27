const axios = require("axios");

async function mineBlock(logisticsNode, req, res) {
  const block = logisticsNode.blockchain.mineBlock();

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
  const hashIsCorrect = lastBlock.hash === block.prevHash;
  const hasCorrectIndex = lastBlock.index + 1 === block.index;

  if (hashIsCorrect && hasCorrectIndex) {
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
