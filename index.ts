import 'reflect-metadata';
import path from "path";
import { ArtusApplication, Scanner } from "@artus/core";

export async function main() {
  const scanner = new Scanner({
    needWriteFile: false,
    excluded: ['dist']
  });
  const manifest = await scanner.scan(path.resolve(__dirname, './'));
  console.log(`[pid] ${process.pid}, manifest:`, manifest);

  const app = new ArtusApplication();
  await app.load(manifest);
  await app.run();
  return app;
}

main();
