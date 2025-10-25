
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const handler =  NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    
  ],
   secret: process.env.NEXTAUTH_SECRET as string,

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


export { handler as GET, handler as POST };


