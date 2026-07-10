import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'node',
    // Cover route-handler tests under app/ (webhook + crons) too, not just lib/.
    include: ['{lib,app}/**/*.test.ts']
  },
  resolve: {
    // Mirror the tsconfig "@/*" path alias so unit tests can import app modules.
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
      // `server-only` throws when imported outside an RSC bundle — stub it so
      // server-only helpers are unit-testable.
      'server-only': fileURLToPath(new URL('./test/server-only-stub.ts', import.meta.url))
    }
  }
});
