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
