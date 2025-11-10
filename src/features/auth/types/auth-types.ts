export type AuthUser = {
  id: string;
  name: string;
  email: string;
  photo?: string | null;
  createdAt?: string;
};

export type LoginResponse = {
  message: string;
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
};

export type RegisterResponse = {
  message: string;
  user: AuthUser;
  accessToken?: string;
  refreshToken?: string;
};

export type ProfileResponse = {
  user: AuthUser;
};
