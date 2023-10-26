import { Request, Response } from "express";
import Node from "../classes/Node";

export default interface NodeCall {
  node: Node;
  req: Request;
  res: Response;
}
