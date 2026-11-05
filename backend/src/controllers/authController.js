import { z } from "zod";
import { authService } from "../services/authService.js";
import { ok, created } from "../utils/response.js";
import { User } from "../models/User.js";
import { fail } from "../utils/response.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Op } from "sequelize";
import { emailService } from "../services/emailService.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authController = {
  async register(req, res, next) {
    try {
      const d = registerSchema.parse(req.body);
      const result = await authService.register(d.name, d.email, d.password);
      return created(res, result, "Compte créé avec succès");
    } catch (e) {
      next(e);
    }
  },

  async login(req, res, next) {
    try {
      const d = loginSchema.parse(req.body);
      const result = await authService.login(d.email, d.password);
      return ok(res, result, "Connexion réussie");
    } catch (e) {
      next(e);
    }
  },

  async me(req, res) {
    return ok(res, req.user);
  },
  async updateProfile(req, res, next) {
    try {
      const { name } = z.object({ name: z.string().min(2) }).parse(req.body);
      const updated = await authService.updateProfile(req.user.id, name);
      return ok(res, updated, "Profil mis à jour");
    } catch (e) {
      next(e);
    }
  },

  async changePassword(req, res, next) {
    try {
      const schema = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
      });
      const { currentPassword, newPassword } = schema.parse(req.body);
      await authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword,
      );
      return ok(res, {}, "Mot de passe modifié avec succès");
    } catch (e) {
      next(e);
    }
  },
  async forgotPassword(req, res, next) {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);

      const user = await User.findOne({ where: { email } });

      // ⚠️ Sécurité : on répond TOUJOURS pareil (on ne révèle pas si l'email existe)
      if (user) {
        // Génère un code à 6 chiffres (100000-999999)
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await user.update({
          resetCode: code,
          resetCodeExpiry: expiry,
        });

        await emailService.sendResetCode(email, code);
      }

      return ok(res, {}, "Si un compte existe, un code a été envoyé.");
    } catch (e) {
      next(e);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { email, code, newPassword } = z
        .object({
          email: z.string().email(),
          code: z.string().length(6, "Le code doit contenir 6 chiffres"),
          newPassword: z.string().min(8),
        })
        .parse(req.body);

      const user = await User.findOne({
        where: {
          email,
          resetCode: code,
          resetCodeExpiry: { [Op.gt]: new Date() },
        },
      });

      if (!user) {
        return fail(res, 400, "Code invalide ou expiré.");
      }

      // Hash le nouveau mot de passe
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Met à jour et supprime le code (usage unique)
      await user.update({
        passwordHash,
        resetCode: null,
        resetCodeExpiry: null,
      });

      return ok(res, {}, "Mot de passe réinitialisé avec succès.");
    } catch (e) {
      next(e);
    }
  },
};
