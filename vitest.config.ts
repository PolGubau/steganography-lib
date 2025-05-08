import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true, // Habilita los globals para usar `expect` directamente
		environment: "jsdom", // Necesario para manipulación de DOM en pruebas
		coverage: {
			provider: "v8",
			thresholds: {
				lines: 0,
				branches: 0,
				functions: 0,
				statements: 0,
			},
			reportsDirectory: "./.coverage",
			reporter: ["json-summary", "text"],
			reportOnFailure: true,
			include: ["**/*.ts", "**/*.tsx"],
			exclude: [
				"dist/",
				"node_modules/",
				"coverage/",
				"**/*.d.ts",
				"**/*.test.ts",
				"**/*.test.tsx",
				"**/index.ts",
			],
		},
	},
});
