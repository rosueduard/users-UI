export interface User {
  id?: string | number;
  firstName: string;
  lastName: string;
  email: string;
  role?: UserRole;
}

export enum UserRole {
  Admin = 'Admin',
  User = 'User',
}
