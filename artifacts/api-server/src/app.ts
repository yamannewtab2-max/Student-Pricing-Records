import express, { type Express } from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import type { IncomingMessage, ServerResponse } from "node:http";
import router from "./routes";
import { logger } from "./lib/logger";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: IncomingMessage & { id?: string | number }) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: ServerResponse) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve static files from the frontend dist folder
// In production, __dirname is dist/. The frontend dist is at ../../../dist/
// But wait! Is the frontend built to the root /dist or student-pricing/dist?
// In root package.json: pnpm --filter @workspace/student-pricing run build
// In student-pricing/vite.config.ts: outDir: path.resolve(import.meta.dirname, '../../dist')
// So frontend builds to root/dist.
// api-server builds to artifacts/api-server/dist.
// From api-server/dist to root/dist: ../../../dist
const frontendDistPath = path.resolve(__dirname, "../../../dist");

app.use(express.static(frontendDistPath));

app.get("*", (req, res) => {
  const indexHtmlPath = path.join(frontendDistPath, "index.html");
  if (fs.existsSync(indexHtmlPath)) {
    res.sendFile(indexHtmlPath);
  } else {
    res.status(404).send("Not Found");
  }
});

export default app;
