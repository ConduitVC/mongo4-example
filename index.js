const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

async function main() {
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
  const [{ insertedId: oneID }, { insertedId: twoID }] = await Promise.all([
    collection.insertOne(testObjOne, { session }),
    collection.insertOne(testObjTwo, { session })
  ]);

  const read = await collection.findOne({ _id: oneID });
  assert(read == null, "should not be able to find object until commit");

  const out = await session.commitTransaction();
  const readAfterCommit = await collection.findOne({ _id: oneID });
  assert(readAfterCommit, "can find object after commit");

  client.close();
}

main().catch(err => {
  console.error(err.stack);
  process.exit(1);
});
