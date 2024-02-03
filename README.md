**Assignment Description:**  
Create an logistics blockchain where one can follow the journey of bread from the wheat producer to the store.

- A farmer harvests wheat.
- The mill grinds it into flour.
- The baker bakes bread.
- The retailer receives the bread.

Each link above should be documented in the blockchain.

A customer buying the bread should thus be able to trace it back to the baker, to the mill, to the farmer.
An REST API is provided to set up the network, i.e. add nodes to the network, and to interact with the blockchain, i.e. create shipments, send shipments and mine blocks. 

**Instructions:**  
- Run "npm run all-nodes" to start all servers, the farmer, the mill, the baker, and the shop.
- Import `Bread.postman_collection.json` from the postman folder into Postman to test the API.
