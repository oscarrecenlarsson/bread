class Block {
  constructor({ nonce, data, prevHash, hash, index }) {
    this.index = index;
    this.timestamp = Date.now();
    this.data = data;
    this.nonce = nonce;
    this.hash = hash;
    this.prevHash = prevHash;
  }

  static genesis() {
    const nonce = 1;
    const data = null;
    const prevHash = "Genesis";
    const hash = "Genesis";
    const index = 1;
    return new this({ nonce, data, prevHash, hash, index });
  }
}

module.exports = Block;
