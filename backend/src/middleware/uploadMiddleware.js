import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env.js";

const uploadDir = path.resolve(env.uploadDir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTS = [".pdf", ".docx"];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

export const uploadCV = multer({
  storage,
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_MIMES.includes(file.mimetype) || !ALLOWED_EXTS.includes(ext)) {
      const e = new Error("Format non autorisé (PDF ou DOCX uniquement)");
      e.status = 400;
      return cb(e);
    }
    cb(null, true);
  },
}).single("file");

const CV_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const CV_EXTS = [".pdf", ".docx"];

const IMG_MIMES = ["image/jpeg", "image/png", "image/webp"];
const IMG_EXTS = [".jpg", ".jpeg", ".png", ".webp"];

export const uploadOfferImage = multer({
  storage,
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!IMG_MIMES.includes(file.mimetype) || !IMG_EXTS.includes(ext)) {
      const e = new Error("Format non autorisé (JPG, PNG ou WEBP uniquement)");
      e.status = 400;
      return cb(e);
    }
    cb(null, true);
  },
}).single("file");
