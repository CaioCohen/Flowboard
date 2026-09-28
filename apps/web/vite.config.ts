import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const DEFAULT_DEV_SERVER_PORT = 5173;

function resolvePort(value: string | undefined): number {
  const port = Number(value);

  return Number.isInteger(port) && port > 0 ? port : DEFAULT_DEV_SERVER_PORT;
}

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    server: {
      host: environment.VITE_DEV_SERVER_HOST ?? "127.0.0.1",
      port: resolvePort(environment.VITE_DEV_SERVER_PORT),
      strictPort: true,
    },
    preview: {
      host: environment.VITE_DEV_SERVER_HOST ?? "127.0.0.1",
      port: resolvePort(environment.VITE_PREVIEW_PORT),
      strictPort: true,
    },
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  };
});
