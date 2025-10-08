const fs = require("node:fs");
const path = require("node:path");

const express = require("express");

const envFile = path.join(__dirname, ".env");
if (fs.existsSync(envFile)) {
  const contents = fs.readFileSync(envFile, "utf8");
  contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      const value = valueParts.join("=").trim();
      if (key && !Object.prototype.hasOwnProperty.call(process.env, key)) {
        process.env[key] = value;
      }
    });
}

const app = express();

const PORT = Number(process.env.PRINTER_SERVICE_PORT || process.env.PORT || 4000);
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  if (allowedOrigins.length === 0) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (req.headers.origin && allowedOrigins.includes(req.headers.origin)) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${new Date().toISOString()} | ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });
  next();
});

app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/print", (req, res, next) => {
  try {
    const job = req.body;

    if (!job || typeof job !== "object") {
      return res.status(400).json({ ok: false, error: "Missing print job payload" });
    }

    const { orderId, items } = job;

    if (!orderId || typeof orderId !== "string") {
      return res.status(400).json({ ok: false, error: "Expected orderId string" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: "Expected non-empty items array" });
    }

    console.log(
      `${new Date().toISOString()} | 🖨️  Print job accepted for order ${orderId} with ${items.length} item(s)`
    );

    res.status(202).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

const distPath = path.join(__dirname, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.method !== "GET") {
      next();
      return;
    }

    const acceptHeader = req.headers.accept || "";
    if (acceptHeader.includes("text/html")) {
      res.sendFile(path.join(distPath, "index.html"));
      return;
    }

    next();
  });
}

app.use((error, _req, res, _next) => {
  console.error("Unexpected error while handling request", error);
  res.status(500).json({ ok: false, error: "Internal Server Error" });
});

const server = app.listen(PORT, () => {
  console.log(`Kitchen KDS server listening on port ${PORT}`);
});

const shutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
