/* ---------- Utilisateur ---------- */
export interface User {
  id: number;
  name: string;
  email: string;
  preferredLanguage: string;
}

/* ---------- Auth ---------- */
export interface AuthResponse {
  token: string;
  user: User;
}

/* ---------- Réponse API générique ---------- */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: { path: string; message: string }[];
}
