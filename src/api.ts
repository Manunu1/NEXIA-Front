import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { clearSession, getRefreshToken, setTokens } from './utils/session';

/* ─────────────────────────────────────────────
   CLIENTE API — adjunta el access token a cada
   request y, ante un 401, intenta renovarlo con
   el refresh token (una sola renovación en vuelo;
   los requests concurrentes la reutilizan).
───────────────────────────────────────────── */

const BASE_URL = 'http://localhost:3000';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshEnCurso: Promise<string | null> | null = null;

async function renovarAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    // axios "crudo" a propósito: si este request diera 401 no debe
    // volver a entrar al interceptor y generar un loop.
    const res = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
    const data = res.data?.data;
    if (!data?.token) return null;
    setTokens(data.token, data.refreshToken);
    return data.token;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      refreshEnCurso = refreshEnCurso ?? renovarAccessToken().finally(() => {
        refreshEnCurso = null;
      });
      const nuevoToken = await refreshEnCurso;

      if (nuevoToken) {
        original.headers.Authorization = `Bearer ${nuevoToken}`;
        return api(original);
      }

      // Refresh inválido o expirado → cerrar sesión
      clearSession();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
