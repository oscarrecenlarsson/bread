import BlockInput from "../interfaces/Block";
import Block from "./Block";
import sha256 from "sha256";
import Shipment from "./Shipment";

export default class Blockchain {
  chain: Block[];
  pendingList: Shipment[];

  constructor() {
    this.chain = [Block.genesis()];
    this.pendingList = [];
  }
  createBlock({ nonce, data, prevHash, hash, index }: BlockInput): Block {
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

  getLastBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  createHash(prevHash: string, data: any, nonce: number): string {
    const stringToHash = prevHash + JSON.stringify(data) + nonce.toString();
    const hash = sha256(stringToHash);
    return hash;
  }

  proofOfWork(prevHash: string, data: any): number {
    let nonce = 0;
    let hash = this.createHash(prevHash, data, nonce);

    while (hash.substring(0, 4) !== "0000") {
      nonce++;
      hash = this.createHash(prevHash, data, nonce);
    }
    return nonce;
  }

  validateChain(chainToValidate: Block[]): Boolean {
    let isValid = true;

    // validate genesis block
    const genesisBlock = chainToValidate[0];
    isValid = this.validateGenesisBlock(genesisBlock);

    // validate the rest of the chain if genesis block is ok
    if (isValid) {
      for (let i = 1; i < chainToValidate.length; i++) {
        const blockToValidate = chainToValidate[i];
        const prevBlock = chainToValidate[i - 1];
        isValid = this.validateBlock(blockToValidate, prevBlock);
        if (!isValid) {
          break;
        }
      }
    }

    console.log("isValid at end of validateChain", isValid);
    return isValid;
  }

  validateGenesisBlock(genesisBlock: Block): boolean {
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

  validateBlock(blockToValidate: Block, prevBlock: Block): boolean {
    let isValid = true;
    const recreateHash = this.createHash(
      prevBlock.hash,
      blockToValidate.data,
      blockToValidate.nonce
    );

    if (recreateHash !== blockToValidate.hash) {
      console.log("recreate hash:", recreateHash);
      console.log("blockToValidate hash:", blockToValidate.hash);
      console.log("HASH IS INVALID");
      isValid = false;
    }

    if (blockToValidate.index !== prevBlock.index + 1) {
      console.log("blockToValidate index:", blockToValidate.index);
      console.log("prevBlock index + 1:", prevBlock.index + 1);
      console.log("INDEX IS INVALID");
      isValid = false;
    }

    if (blockToValidate.prevHash !== prevBlock.hash) {
      console.log("blockToValidate prevHash:", blockToValidate.prevHash);
      console.log("prevBlock hash:", prevBlock.hash);
      console.log("PREVHASH IS INVALID");
      isValid = false;
    }

    return isValid;
  }
}
