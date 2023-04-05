import { defineConfig } from "tsup"

export default defineConfig({
  minify: true,
  target: "es2015",
  // external: ["react"],
  sourcemap: true,
  dts: true,
  format: ["esm", "cjs", "iife"],
  injectStyle: true,
  esbuildOptions(options) {
    options.define = {
      "process.env.NODE_ENV": JSON.stringify("production"),
    }
    options.banner = {
      js: '"use client"',
    }
  },
})
