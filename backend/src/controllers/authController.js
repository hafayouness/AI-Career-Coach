import { z } from "zod";
import { authService } from "../services/authService.js";
import { ok, created } from "../utils/response.js";

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
};
