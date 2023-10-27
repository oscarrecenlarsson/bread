import express from "express";
import Node from "./models/classes/Node";
import network from "./api/routes/network";
import node from "./api/routes/node";
import "source-map-support/register";
const app = express();
const logisticsNode = new Node(process.argv[3], process.argv[4]);
const PORT = process.argv[2];

//sourceMapSupport.install();

// middleware
app.use(express.json());

app.use("/api/network", network(logisticsNode));
app.use("/api/node", node(logisticsNode));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
