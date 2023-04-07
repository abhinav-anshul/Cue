import { defineConfig } from "tsup"

export default defineConfig({
  minify: true,
  target: "es2015",
  external: ["react"],
  sourcemap: true,
  format: ["esm", "cjs"],
  injectStyle: true,
  dts: true,
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"',
    }
  },
})
