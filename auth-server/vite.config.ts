import { getRequestListener } from "@hono/node-server";
import { defineConfig } from "vite";
import { app } from "./api/index.js";
import dotenv from "dotenv";

if (process.env.NODE_ENV === "development") {
  dotenv.config();
}

// console.log("NODE_ENV", process.env.NODE_ENV);
// console.log("ZERO_AUTH_SECRET", process.env.ZERO_AUTH_SECRET);

export default defineConfig({
  build: {
    target: "es2022",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2022",
    },
  },
  plugins: [
    {
      name: "api-server",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith("/api")) {
            return next();
          }
          getRequestListener(async (request) => {
            return await app.fetch(request, {});
          })(req, res);
        });
      },
    },
  ],
});
