export interface IAuthUser {
  id: number;
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
}
