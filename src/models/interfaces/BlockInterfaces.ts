export interface IBlock {
  index: number;
  timestamp: number;
  data: any;
  nonce: number;
  hash: string;
  prevHash: string;
}

export interface IBlockInput {
  nonce: number;
  data: any;
  prevHash: string;
  hash: string;
  index: number;
}
