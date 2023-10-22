import sourceMapSupport from "source-map-support";
const express = require("express");
const BlockchainNode = require("./models/BlockchainNode");
const network = require("./api/routes/network");
const node = require("./api/routes/node");

sourceMapSupport.install();

console.log("sasfd");

const app = express();
const logisticsNode = new BlockchainNode();
const PORT = process.argv[2];

// middleware
app.use(express.json());

app.use("/api/network", network(logisticsNode));
app.use("/api/node", node(logisticsNode));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
