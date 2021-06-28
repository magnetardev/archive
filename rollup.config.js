import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";

export default {
  input: "src/main.ts",
  output: [
    {
      format: "esm",
      dir: "dist/",
    },
    {
      format: "cjs",
      dir: "dist/node/",
    },
  ],
  plugins: [
    typescript(),
    copy({
      targets: [
        { src: "./src/archive.wasm", dest: ["./dist/", "./dist/node"] },
      ],
    }),
  ],
};
