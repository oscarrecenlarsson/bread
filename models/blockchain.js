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
      isValid = this.validateBlock(blockToValidate, prevBlock);
      if (!isValid) {
        break;
      }
    }

    // validate genesis block
    if (isValid) {
      const genesisBlock = chainToValidate[0];
      isValid = this.validateGenesisBlock(genesisBlock);
    }
    console.log("isValid at end of validateChain", isValid);
    return isValid;
  }

  validateGenesisBlock(genesisBlock) {
    let isValid = true;
    const isNonceValid = genesisBlock.nonce === 1;
    const isHashValid = genesisBlock.hash === "Genesis";
    const isPreviousHashValid = genesisBlock.prevHash === "Genesis";
    const hasNoData = genesisBlock.data === null;

    if (!isNonceValid || !isHashValid || !isPreviousHashValid || !hasNoData) {
      isValid = false;
      console.log("GENESIS BLOCK NOT OK");
    }

    return isValid;
  }

  validateBlock(blockToValidate, prevBlock) {
    let isValid = true;
    const recreateHash = this.createHash(
      prevBlock.hash,
      blockToValidate.data,
      blockToValidate.nonce
    );

    if (recreateHash !== blockToValidate.hash) {
      console.log("recreate hash", recreateHash);
      console.log("blockToValidate hash", blockToValidate.hash);
      console.log("HASH IS INVALID");
      isValid = false;
    }

    if (blockToValidate.prevHash !== prevBlock.hash) {
      console.log("blockToValidate prevHash", blockToValidate.prevHash);
      console.log("prevBlock hash", prevBlock.hash);
      console.log("PREVHASH IS INVALID");
      isValid = false;
    }

    if (blockToValidate.index !== prevBlock.index + 1) {
      console.log("blockToValidate index", blockToValidate.index);
      console.log("prevBlock index + 1", prevBlock.index + 1);
      console.log("INDEX IS INVALID");
      isValid = false;
    }

    return isValid;
  }
}

module.exports = Blockchain;
