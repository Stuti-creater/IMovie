import dns from 'node:dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);
import { env, assertEnv } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

async function main() {
  assertEnv();
  await connectDB();
  createApp().listen(env.port, () => console.log(`[server] IMovies API on :${env.port}`));
}

main().catch((err) => {
  console.error('[fatal]', err.message);
  process.exit(1);
});
