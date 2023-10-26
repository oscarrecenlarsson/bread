export default interface BlockInput {
  nonce: number;
  data: any;
  prevHash: string;
  hash: string;
  index: number;
}
