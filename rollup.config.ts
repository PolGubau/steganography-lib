import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import type { RollupOptions } from "rollup";

import pkg from "./package.json" with { type: "json" };

const config: RollupOptions = {
	input: "src/index.ts",
	output: [
		{
			file: pkg.main,
			format: "cjs",
		},
		{
			file: pkg.module,
			format: "esm",
		},
		{
			file: pkg.browser,
			format: "umd",
			name: pkg.name,
		},
	],
	plugins: [
		resolve({
			// pass custom options to the resolve plugin
			moduleDirectories: ["node_modules"],
		}),
		typescript({ tsconfig: "./tsconfig.json" }),
		json(),
	],
};

export default config;
