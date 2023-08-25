const express = require("express");
const Blockchain = require("./models/blockchain");
const network = require("./api/routes/network");
const node = require("./api/routes/node");

const app = express();
const logisticsBC = new Blockchain();
const PORT = process.argv[2];

// middleware
app.use(express.json());

app.use("/api/network", network(logisticsBC));
app.use("/api/node", node(logisticsBC));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
