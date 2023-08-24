const express = require("express");
const { v4: uuidv4 } = require("uuid");

const Blockchain = require("./blockchain");
const { default: axios } = require("axios");
const app = express();

const network = require("./api/routes/network");
const node = require("./api/routes/node");

const logisticsBC = new Blockchain();
// app.locals.logisticsBC = logisticsBC;
console.log(logisticsBC);

const PORT = process.argv[2];
// const nodeAddress = uuidv4().split("-").join(""); //mining

// Middleware...
app.use(express.json());

app.use("/api/network", network(logisticsBC));
app.use("/api/node", node(logisticsBC));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
