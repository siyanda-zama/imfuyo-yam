import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Phone',
      credentials: {
        phone: { label: 'Phone Number', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone as string },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          plan: user.plan,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register') || nextUrl.pathname.startsWith('/welcome');
      const isAdminPage = nextUrl.pathname.startsWith('/admin');
      const isApiRoute = nextUrl.pathname.startsWith('/api');

      // Allow API routes through (they handle their own auth)
      if (isApiRoute) return true;

      // If on auth pages and already logged in, redirect to appropriate dashboard
      if (isAuthPage) {
        if (isLoggedIn) {
          const role = (session.user as any)?.role;
          if (role === 'ADMIN') {
            return Response.redirect(new URL('/admin', nextUrl));
          }
          return Response.redirect(new URL('/', nextUrl));
        }
        return true; // Allow unauthenticated users to see auth pages
      }

      // Protected routes — must be logged in
      if (!isLoggedIn) {
        return false; // Redirects to signIn page (/login)
      }

      // Admin routes — must have ADMIN role
      if (isAdminPage) {
        const role = (session.user as any)?.role;
        if (role !== 'ADMIN') {
          return Response.redirect(new URL('/', nextUrl));
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.phone = (user as any).phone;
        token.plan = (user as any).plan;
        token.role = (user as any).role;
      }
      // Backfill role for existing tokens that don't have it
      if (!token.role && token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true },
          });
          if (dbUser) token.role = dbUser.role;
        } catch {
          // Ignore — will retry next time
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).phone = token.phone;
        (session.user as any).plan = token.plan;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});
