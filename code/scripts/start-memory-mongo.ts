import { MongoMemoryServer } from "mongodb-memory-server";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  const mongod = await MongoMemoryServer.create({
    instance: { port: 27017, dbName: "globomantics" },
  });

  const uri = mongod.getUri("globomantics");
  const out = join(process.cwd(), ".mongo-memory-uri");
  writeFileSync(out, uri);
  console.log(`MongoMemoryServer running at ${uri}`);
  console.log("Press Ctrl+C to stop.");

  process.on("SIGINT", async () => {
    await mongod.stop();
    process.exit(0);
  });

  // Keep process alive
  await new Promise(() => {});
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
