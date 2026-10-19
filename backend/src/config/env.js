import dotenv from "dotenv";
dotenv.config();

export const env = {
  // ===== Application =====
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),

  // ===== CORS / Frontend =====
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  // ===== Base de données (variables séparées) =====
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    name: process.env.DB_NAME || "ai_career_coach",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "admin",
  },

  // ===== JWT =====
  jwtSecret: process.env.JWT_SECRET || "dev_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // ===== IA =====
  aiProvider: process.env.AI_PROVIDER || "openai",
  aiApiKey: process.env.AI_API_KEY || "",
  aiModel: process.env.AI_MODEL || "gpt-4o-mini",

  // ===== Uploads =====
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 10),
};

// ===== Fail-fast : refuse de démarrer si secrets critiques absents =====
if (!env.jwtSecret || env.jwtSecret === "dev_secret_change_me") {
  if (env.nodeEnv === "production") {
    throw new Error("JWT_SECRET doit être défini en production");
  }
}

if (env.nodeEnv === "production" && !env.aiApiKey) {
  console.warn("⚠️  AI_API_KEY manquante — les fonctionnalités IA échoueront");
}
