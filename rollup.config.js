import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";

export default {
  input: "src/main.ts",
  output: [
    {
      format: "esm",
      file: "dist/main.js",
    },
    {
      format: "cjs",
      file: "dist/main.cjs",
    },
  ],
  plugins: [
    typescript(),
    copy({
      targets: [{ src: "./src/archive.wasm", dest: ["./dist/"] }],
    }),
  ],
};
