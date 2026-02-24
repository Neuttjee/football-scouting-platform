import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Tijdelijke prisma instance voor auth config
const prisma = new PrismaClient()

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      clubId: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
    clubId: string
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Wachtwoord', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email) },
          include: { club: true },
        })

        if (!user || !user.isActive) {
          return null
        }

        const isValidPassword = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        )

        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          clubId: user.clubId,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.clubId = user.clubId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.clubId = token.clubId as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
