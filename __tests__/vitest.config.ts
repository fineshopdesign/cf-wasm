import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 10 * 1000,
  },
});
