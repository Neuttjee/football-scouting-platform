import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      clubId: string
      clubName: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string
    clubId: string
    clubName: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    clubId: string
    clubName: string
  }
}