import { UserRole } from "@prisma/client";

export type IAuthUser = {
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
} | null;
