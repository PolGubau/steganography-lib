import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" with { type: "json" };

/** @type {import('rollup').RollupOptions} */
export default {
	input: "src/index.ts",
	output: [
		{ file: pkg.main, format: "cjs" },
		{ file: pkg.module, format: "esm" },
		{ file: pkg.browser, format: "umd", name: pkg.name },
	],
	plugins: [
		resolve(),
		typescript({
			tsconfig: "./tsconfig.json",
			declaration: true, // Habilita la generación de archivos .d.ts
			declarationDir: "lib/types", // Donde quieres que se guarden los tipos
			exclude: ["node_modules/**"],
		}),
		json(),
	],
};
