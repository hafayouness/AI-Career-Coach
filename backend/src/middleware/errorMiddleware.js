import { ZodError } from "zod";

export const errorHandler = (err, _req, res, _next) => {
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

  const status = err.status || 500;
  const message = err.message || "Une erreur est survenue";

  if (status === 500) console.error("❌", err);

  return res.status(status).json({ success: false, message, errors: [] });
};
