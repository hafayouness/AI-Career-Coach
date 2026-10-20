export const ok = (
  res,
  data = {},
  message = "Opération réalisée avec succès",
) => res.status(200).json({ success: true, data, message });

export const created = (res, data = {}, message = "Créé avec succès") =>
  res.status(201).json({ success: true, data, message });

export const fail = (res, status, message, errors = []) =>
  res.status(status).json({ success: false, message, errors });
