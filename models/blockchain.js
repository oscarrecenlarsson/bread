const sha256 = require("sha256");
const Block = require("./Block");

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
    this.pendingList = [];
  }
  createBlock({ nonce, data, prevHash, hash, index }) {
    const newBlock = new Block({ nonce, data, prevHash, hash, index });
    return newBlock;
  }

  mineBlock() {
    const prevBlock = this.getLastBlock();
    const prevHash = prevBlock.hash;
    const data = this.pendingList;
    const index = this.chain.length + 1;
    const nonce = this.proofOfWork(prevHash, data);
    const hash = this.createHash(prevHash, data, nonce);
    const newBlock = this.createBlock({ nonce, data, prevHash, hash, index });
    this.chain.push(newBlock);
    this.pendingList = [];

    return newBlock;
  }

  getLastBlock() {
    return this.chain.at(-1);
  }

  createHash(prevHash, data, nonce) {
    const stringToHash = prevHash + JSON.stringify(data) + nonce.toString();
    const hash = sha256(stringToHash);
    return hash;
  }

  proofOfWork(prevHash, data) {
    let nonce = 0;
    let hash = this.createHash(prevHash, data, nonce);

    while (hash.substring(0, 4) !== "0000") {
      nonce++;
      hash = this.createHash(prevHash, data, nonce);
    }
    return nonce;
  }

  validateChain(chainToValidate) {
    let isValid = true;

    for (let i = 1; i < chainToValidate.length; i++) {
      const blockToValidate = chainToValidate[i];
      const prevBlock = chainToValidate[i - 1];
      const hash = this.createHash(
        prevBlock.hash,
        blockToValidate.data,
        blockToValidate.nonce
      );

      if (hash !== blockToValidate.hash) {
        isValid = false;
        console.log("HASH IS INVALID");
      }

      if (blockToValidate.prevHash !== prevBlock.hash) {
        isValid = false;
        console.log("prevhash IS INVALID");
      }

      if (blockToValidate.index !== prevBlock.index + 1) {
        console.log("INDEX IS INVALID");
        isValid = false;
      }
    }

    // validate genesis block
    const genesisBlock = chainToValidate.at(0);
    const isGenesisNonceValid = genesisBlock.nonce === 1;
    const isGenesisHashValid = genesisBlock.hash === "Genesis";
    const isGenesisPreviousHashValid = genesisBlock.prevHash === "Genesis";
    const hasNoData = genesisBlock.data === null;

    if (
      !isGenesisNonceValid ||
      !isGenesisHashValid ||
      !isGenesisPreviousHashValid ||
      !hasNoData
    ) {
      isValid = false;
      console.log("GENESIS BLOCK NOT OK");
    }
    console.log("isValid", isValid);
    return isValid;
  }

  validateBlock(blockToValidate, prevBlock) {
    let isValid = true;
    const hash = this.createHash(
      prevBlock.hash,
      blockToValidate.data,
      blockToValidate.nonce
    );

    if (hash !== blockToValidate.hash) {
      console.log("HASH IS INVALID");
      isValid = false;
    }

    if (blockToValidate.prevHash !== prevBlock.hash) {
      console.log("prevhash IS INVALID");
      isValid = false;
    }

    if (blockToValidate.index !== prevBlock.index + 1) {
      console.log("INDEX IS INVALID");
      isValid = false;
    }

    return isValid;
  }
}

module.exports = Blockchain;
