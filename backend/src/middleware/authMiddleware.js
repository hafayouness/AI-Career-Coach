import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/index.js";

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
        errors: [],
      });
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, env.jwtSecret);

    const user = await User.findByPk(payload.sub, {
      attributes: ["id", "name", "email", "preferredLanguage"],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur introuvable",
        errors: [],
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token invalide",
      errors: [],
    });
  }
};
