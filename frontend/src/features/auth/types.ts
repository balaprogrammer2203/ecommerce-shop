export type User = {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type BackendAuthResponse = {
  _id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  token: string;
};

export type BackendMeResponse = {
  _id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
};
