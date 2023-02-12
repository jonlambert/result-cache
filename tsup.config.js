import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/redis.ts'],
  outDir: 'dist',
  esbuildPlugins: [],
  dts: true,
  sourcemap: true,
});
