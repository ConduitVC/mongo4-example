async function main() {
  const MongoClient = require("mongodb").MongoClient;
  const assert = require("assert");

  // Connection URL
  const url = "mongodb://localhost:27017";

  // Database Name
  const dbName = "myproject";
  const collectionName = "test";

  // Use connect method to connect to the server
  const client = await MongoClient.connect(url);
  console.log("Connected successfully to server");

  const db = client.db(dbName);
  const collection = await db.createCollection(collectionName);

  const session = client.startSession();
  session.startTransaction({
    readConcern: { level: "majority" },
    writeConcern: { w: 2, j: true, wtimeout: 500 }
  });

  const testObjOne = { foo: 1 };
  const testObjTwo = { foobar: 1 };
  await Promise.all([
    collection.insertOne(testObjOne, { session }),
    collection.insertOne(testObjTwo, { session })
  ]);

  const out = await session.commitTransaction();

  client.close();
}

main().catch(err => {
  console.error(err.stack);
  process.exit(1);
});
