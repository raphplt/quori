// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Types pour les réponses de l'API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Fonction utilitaire pour les requêtes authentifiées
export const authenticatedFetch = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });
};

// Fonction pour les requêtes GET authentifiées
export const authenticatedGet = async <T = unknown>(endpoint: string): Promise<T> => {
  const response = await authenticatedFetch(endpoint);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

// Fonction pour les requêtes POST authentifiées
export const authenticatedPost = async <T = unknown, D = unknown>(
  endpoint: string,
  data?: D
): Promise<T> => {
  const response = await authenticatedFetch(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

// Fonction pour les requêtes PUT authentifiées
export const authenticatedPut = async <T = unknown, D = unknown>(
  endpoint: string,
  data?: D
): Promise<T> => {
  const response = await authenticatedFetch(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

// Fonction pour les requêtes DELETE authentifiées
export const authenticatedDelete = async <T = unknown>(endpoint: string): Promise<T> => {
  const response = await authenticatedFetch(endpoint, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

// Hook pour vérifier si un token est valide
export const isTokenValid = async (): Promise<boolean> => {
  try {
    const response = await authenticatedFetch('/auth/me');
    return response.ok;
  } catch {
    return false;
  }
};

// Fonction pour nettoyer le token lors d'une erreur d'authentification
export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

export { API_BASE_URL };
