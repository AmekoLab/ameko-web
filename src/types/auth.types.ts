export interface LoginPayload {
  username: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  token: string;
}
