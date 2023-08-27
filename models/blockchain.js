const sha256 = require("sha256");
const Block = require("./Block");

function Blockchain() {
  this.chain = [Block.genesis()];
  this.pendingList = [];
}

Blockchain.prototype.createBlock = function (nonce, prevHash, hash) {
  const index = this.chain.length + 1;
  const data = this.pendingList;
  const newBlock = new Block({ nonce, data, prevHash, hash, index });
  this.pendingList = [];
  this.chain.push(newBlock);
  return newBlock;
};

Blockchain.prototype.mineBlock = function () {
  const previousBlock = this.getLastBlock();
  const previousHash = previousBlock.hash;
  const data = {
    data: this.pendingList,
    index: previousBlock.index + 1,
  };
  const nonce = this.proofOfWork(previousHash, data);
  const hash = this.createHash(previousHash, data, nonce);

  return this.createBlock(nonce, previousHash, hash);
};

Blockchain.prototype.getLastBlock = function () {
  return this.chain.at(-1);
};

Blockchain.prototype.createHash = function (prevHash, data, nonce) {
  const stringToHash = prevHash + JSON.stringify(data) + nonce.toString();
  const hash = sha256(stringToHash);
  return hash;
};

Blockchain.prototype.proofOfWork = function (prevHash, data) {
  let nonce = 0;
  let hash = this.createHash(prevHash, data, nonce);

  while (hash.substring(0, 4) !== "0000") {
    nonce++;
    hash = this.createHash(prevHash, data, nonce);
  }
  return nonce;
};

Blockchain.prototype.validateChain = function (blockChain) {
  let isValid = true;

  for (i = 1; i < blockChain.length; i++) {
    const block = blockChain[i];
    const previousBlock = blockChain[i - 1];
    const hash = this.createHash(
      previousBlock.hash,
      { data: block.data, index: block.index },
      block.nonce
    );

    if (hash !== block.hash) {
      isValid = false;
    }

    if (block.previousHash !== previousBlock.hash) {
      isValid = false;
    }
  }

  // validate genesis block
  const genesisBlock = blockChain.at(0);
  const isGenesisNonceValid = genesisBlock.nonce === 1;
  const isGenesisHashValid = genesisBlock.hash === "Genesis";
  const isGenesisPreviousHashValid = genesisBlock.previousHash === "Genesis";
  const hasNoData = genesisBlock.data === null;

  if (
    !isGenesisNonceValid ||
    !isGenesisHashValid ||
    !isGenesisPreviousHashValid ||
    !hasNoData
  ) {
    isValid = false;
  }

  return isValid;
};

module.exports = Blockchain;
