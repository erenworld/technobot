export type ApiState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type AuthState = {
  email: string;
  password: string;
  message: string | null;
  error: string | null;
  loading: boolean;
};

export type AuthMode = 'login' | 'register';
