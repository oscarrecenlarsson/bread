const Blockchain = require("../../models/Blockchain");
const blockchain = new Blockchain();

//Check comment for changed prevHash

const testDataChain = {
  chain: [
    {
      index: 1,
      timestamp: 1693230851747,
      data: null,
      nonce: 1,
      hash: "Genesis",
      prevHash: "Genesis",
    },
    {
      index: 2,
      timestamp: 1693230860158,
      data: [
        {
          shipmentId: "024d0da604be477d98342b899f563d87",
          currentTime:
            "Mon Aug 28 2023 15:54:19 GMT+0200 (centraleuropeisk sommartid)",
          route: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
          ],
          sender: "http://localhost:3000",
          currentLocation: "http://localhost:3000",
          destination: "http://localhost:3002",
          delivered: false,
          products: ["prod1", "prod2", "prod3"],
        },
        {
          shipmentId: "024d0da604be477d98342b899f563d87",
          currentTime:
            "Mon Aug 28 2023 15:54:19 GMT+0200 (centraleuropeisk sommartid)",
          route: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
          ],
          sender: "http://localhost:3000",
          currentLocation: "http://localhost:3001",
          destination: "http://localhost:3002",
          delivered: false,
          products: ["prod1", "prod2", "prod3"],
        },
        {
          shipmentId: "024d0da604be477d98342b899f563d87",
          currentTime:
            "Mon Aug 28 2023 15:54:19 GMT+0200 (centraleuropeisk sommartid)",
          route: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
          ],
          sender: "http://localhost:3000",
          currentLocation: "http://localhost:3002",
          destination: "http://localhost:3002",
          delivered: true,
          products: ["prod1", "prod2", "prod3"],
        },
      ],
      nonce: 4764,
      hash: "0000cdcf49447a6f63d794cde272e0503a215fd60b472efa818e4a4030f162de",
      prevHash: "Genesis",
    },
  ],
};

console.log(
  "Is prevHash valid: ",
  blockchain.validateChain(testDataChain.chain)
);
