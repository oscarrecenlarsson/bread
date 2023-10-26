import express from "express";
const router = express.Router();
import node from "./node";
import {
  createAndBroadcastShipment,
  recieveAndBroadcastUpdatedShipment,
} from "../controllers/shipmentController";
import { createAndBroadcastNode } from "../controllers/nodeController";
import { mineAndBroadcastBlock } from "../controllers/blockController";
import Node from "../../models/classes/Node";

export default function (logisticsNode: Node) {
  router.use("/api/node", node(logisticsNode));

  router.post("/node", async (req, res) => {
    await createAndBroadcastNode(logisticsNode, req, res);
  });

  router
    .route("/shipment")
    .post(async (req, res) => {
      await createAndBroadcastShipment(logisticsNode, req, res);
    })
    .patch(async (req, res) => {
      await recieveAndBroadcastUpdatedShipment(logisticsNode, req, res);
    });

  router.post("/block", async (req, res) => {
    await mineAndBroadcastBlock(logisticsNode, req, res);
  });
  return router;
}
