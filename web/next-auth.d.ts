// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    wallet?: string | null;
  }

  interface Session {
    user: User;
  }
}
