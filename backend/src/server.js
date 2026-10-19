import express from "express";
import cors from "cors";
import helmet from "helmet";
import { ZodError } from "zod";

import { env } from "./config/env.js";
import { sequelize } from "./config/database.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ===== Parsing =====
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

if (env.nodeEnv === "development") {
  app.use((req, _res, next) => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
    );
    next();
  });
}

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      env: env.nodeEnv,
      timestamp: new Date().toISOString(),
    },
    message: "API en ligne",
  });
});

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route introuvable",
    errors: [],
  });
});

app.use((err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Données invalides",
      errors: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: `Fichier trop volumineux (max ${env.maxFileSizeMb} Mo)`,
      errors: [],
    });
  }

  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    return res.status(422).json({
      success: false,
      message: "Erreur de validation en base de données",
      errors:
        err.errors?.map((e) => ({ path: e.path, message: e.message })) || [],
    });
  }

  const status = err.status || 500;
  const message = err.message || "Une erreur est survenue";

  if (status === 500) {
    console.error("❌ Erreur serveur :", err);
  }

  return res.status(status).json({
    success: false,
    message,
    errors: [],
  });
});

async function start() {
  try {
    console.log("🔌 Connexion à PostgreSQL...");
    await sequelize.authenticate();
    console.log(
      `✅ PostgreSQL connecté (${env.db.host}:${env.db.port}/${env.db.name})`,
    );

    if (env.nodeEnv === "development") {
      await sequelize.sync({ alter: true });
      console.log("✅ Modèles synchronisés");
    }

    app.listen(env.port, () => {
      console.log("");
      console.log("═══════════════════════════════════════════");
      console.log("🚀 AI Career Coach API");
      console.log("═══════════════════════════════════════════");
      console.log(`   Environnement : ${env.nodeEnv}`);
      console.log(`   URL           : http://localhost:${env.port}`);
      console.log(`   Health        : http://localhost:${env.port}/api/health`);
      console.log(`   CORS          : ${env.clientUrl}`);
      console.log("═══════════════════════════════════════════");
      console.log("");
    });
  } catch (err) {
    console.error("❌ Démarrage échoué :");
    console.error("   ", err.message);
    if (err.original) console.error("   Détail DB :", err.original.message);
    process.exit(1);
  }
}

start();
