const axios = require("axios");

async function mineBlock(logisticsNode, req, res) {
  const previousBlock = logisticsNode.blockchain.getLastBlock();
  const previousHash = previousBlock.hash;
  const data = {
    data: logisticsNode.blockchain.pendingList,
    index: previousBlock.index + 1,
  };
  const nonce = logisticsNode.blockchain.proofOfWork(previousHash, data);
  const hash = logisticsNode.blockchain.createHash(previousHash, data, nonce);

  const block = logisticsNode.blockchain.createBlock(nonce, previousHash, hash);

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
  const hashIsCorrect = lastBlock.hash === block.previousHash;
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
