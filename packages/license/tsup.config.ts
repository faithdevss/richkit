import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  // A key covers every version released before its `updatesUntil` date, so
  // each published build has to know when it was released. The Pro packages
  // are released in lockstep with this one (see .changeset/config.json).
  define: {
    __RICHKIT_RELEASE_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
})
