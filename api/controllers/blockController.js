const axios = require("axios");

async function mineBlock(logisticsBC, req, res) {
  const previousBlock = logisticsBC.getLastBlock();
  const previousHash = previousBlock.hash;
  const data = {
    data: logisticsBC.pendingList,
    index: previousBlock.index + 1,
  };
  const nonce = logisticsBC.proofOfWork(previousHash, data);
  const hash = logisticsBC.createHash(previousHash, data, nonce);

  const block = logisticsBC.createBlock(nonce, previousHash, hash);

  logisticsBC.networkNodes.forEach(async (url) => {
    await axios.post(`${url}/api/node/block`, { block: block });
  });

  res.status(200).json({
    success: true,
    data: block,
  });
}

function validateAndRegisterBlockAtNode(logisticsBC, req, res) {
  const block = req.body.block;
  const lastBlock = logisticsBC.getLastBlock();
  const hashIsCorrect = lastBlock.hash === block.previousHash;
  const hasCorrectIndex = lastBlock.index + 1 === block.index;

  if (hashIsCorrect && hasCorrectIndex) {
    logisticsBC.chain.push(block);
    logisticsBC.pendingList = [];

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
