import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: './',
    include: ['src/**/*.spec.ts'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
  // esbuild não emite `emitDecoratorMetadata`, necessário para o DI do Nest e o TypeORM
  plugins: [swc.vite({ module: { type: 'es6' } })],
});
