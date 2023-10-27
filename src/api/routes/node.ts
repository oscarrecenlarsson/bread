import express from "express";
const router = express.Router();

import {
  registerNetworkNodeAtNode,
  registerNetworkNodesAtNode,
  getFullNode,
  synchronizeNode,
} from "../controllers/nodeController";
import {
  registerShipmentAtNode,
  SendShipmentToNextNode,
  getProcessAndSendShipmentById,
} from "../controllers/shipmentController";
import { validateAndRegisterBlockAtNode } from "../controllers/blockController";
import BlockchainNode from "../../models/classes/BlockchainNode";

export default function (logisticsNode: BlockchainNode) {
  router.get("/", (req, res) => {
    getFullNode(logisticsNode, req, res);
  });

  router.post("/shipment", (req, res) => {
    registerShipmentAtNode(logisticsNode, req, res);
  });

  router
    .route("/shipments/shipment/:id")
    .get((req, res) => {
      getProcessAndSendShipmentById(logisticsNode, req, res);
    })
    .patch(async (req, res) => {
      await SendShipmentToNextNode(logisticsNode, req, res);
    });

  router.post("/block", (req, res) => {
    validateAndRegisterBlockAtNode(logisticsNode, req, res);
  });

  router.post("/node", (req, res) => {
    registerNetworkNodeAtNode(logisticsNode, req, res);
  });

  router.post("/nodes", (req, res) => {
    registerNetworkNodesAtNode(logisticsNode, req, res);
  });

  router.get("/consensus", async (req, res) => {
    await synchronizeNode(logisticsNode, req, res);
  });
  return router;
}
