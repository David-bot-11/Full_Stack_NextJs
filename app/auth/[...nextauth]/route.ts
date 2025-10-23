
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt", 
  },

  callbacks: {
    
    async session({ session, token }) {
      
      session.user = {
        id: token.id as string,
      };
      return session;
    },

    
    async jwt({ token, user }) {
      
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
});
