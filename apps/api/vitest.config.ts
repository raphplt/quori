import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: __dirname,
  test: {
    environment: 'node',
    globals: true,
    include: [
      'src/github/parse-git-event.spec.vitest.ts',
      'src/quota/quota.service.spec.vitest.ts',
      'src/github/generate.service.template.spec.vitest.ts',
    ],
  },
});
