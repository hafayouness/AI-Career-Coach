import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { env } from "../config/env.js";

const buildAuthPayload = (user) => {
  const token = jwt.sign({ sub: user.id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      preferredLanguage: user.preferredLanguage,
    },
  };
};

export const authService = {
  async register(name, email, password) {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      const e = new Error("Email déjà utilisé");
      e.status = 409;
      throw e;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    return buildAuthPayload(user);
  },

  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const e = new Error("Identifiants invalides");
      e.status = 401;
      throw e;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      const e = new Error("Identifiants invalides");
      e.status = 401;
      throw e;
    }
    return buildAuthPayload(user);
  },
};
