export interface JwtAccessPayload {
  sub: string; // User ID
  companyId: string; // Company ID for multi-tenancy
  username: string;
  email: string;
  type: 'access';
}

export interface JwtRefreshPayload {
  sub: string; // User ID
  companyId: string; // Company ID for multi-tenancy
  username: string;
  email: string;
  type: 'refresh';
  deviceId: string;
}

export type JwtPayload = JwtAccessPayload | JwtRefreshPayload;

export interface AuthenticatedUser {
  id: string;
  companyId: string;
  username: string;
  email: string;
}
