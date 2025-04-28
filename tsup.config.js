import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/redis.ts',
    'src/ioredis.ts',
    'src/dynamodb.ts',
  ],
  outDir: 'dist',
  esbuildPlugins: [],
  dts: true,
  sourcemap: true,
});
