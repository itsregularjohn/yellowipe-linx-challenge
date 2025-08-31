import { API_BASE_URL, AUTH_STORAGE_KEY } from '../../../constants';

export class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem(AUTH_STORAGE_KEY);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, errorData.message || errorData.error || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const result = await response.json();
  return result.data || result;
}