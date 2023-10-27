import { Request, Response } from "express";
import BlockchainNode from "../classes/BlockchainNode";

export default interface NodeCall {
  node: BlockchainNode;
  req: Request;
  res: Response;
}
