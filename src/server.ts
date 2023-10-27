import express from "express";
import Node from "./models/classes/Node";
import network from "./api/routes/network";
import node from "./api/routes/node";
const app = express();

const PORT = process.argv[2];
const NODEURL = process.argv[3];
const NODENAME = process.argv[4];

export const logisticsNode = new Node(NODEURL, NODENAME);

// middleware
app.use(express.json());

app.use("/api/network", network(logisticsNode));
app.use("/api/node", node(logisticsNode));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
