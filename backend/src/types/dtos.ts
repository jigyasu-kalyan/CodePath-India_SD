export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  role: string;
}