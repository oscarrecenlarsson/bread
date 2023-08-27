const express = require("express");

const Node = require("./models/Node");
const network = require("./api/routes/network");
const node = require("./api/routes/node");

const app = express();
const logisticsNode = new Node();
const PORT = process.argv[2];

// middleware
app.use(express.json());

app.use("/api/network", network(logisticsNode));
app.use("/api/node", node(logisticsNode));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
