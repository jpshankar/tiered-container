import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/TieredContainer.tsx'],
  format: ['esm', 'cjs'],
  dts: true,        // emit .d.ts
  sourcemap: true,
  clean: true,
  target: 'esnext',
  treeshake: true
});