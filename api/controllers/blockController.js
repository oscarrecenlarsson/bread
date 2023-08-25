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

  // logisticsBC.addTransaction(6.25, "00", nodeAddress); //mining

  const block = logisticsBC.createBlock(nonce, previousHash, hash);

  logisticsBC.networkNodes.forEach(async (url) => {
    // anropa en endpoint vi ska kalla api/block som tar argument i body vårt nya block

    await axios.post(`${url}/api/node/block`, { block: block });
  });

  // no mining reward required
  // await axios.post(`${logisticsBC.nodeUrl}/shipment`, {
  //   amount: 6.25,
  //   sender: "00",
  //   recipient: nodeAddress,
  // });

  res.status(200).json({
    success: true,
    data: block,
  });
}

module.exports = { mineBlock };
