import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/utils/db";
import User from "@/models/User";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        username: {
          label: "Username",
          type: "text",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        try {

          console.log("=== LOGIN ATTEMPT ===");
          console.log("Credentials:", credentials);

          // CONNECT DATABASE
          await connectToDatabase();

          console.log("MongoDB connected");

          // CHECK USER
          const existingUser = await User.findOne({
            username: credentials.username,
          });

          console.log("Existing User:", existingUser);

          if (!existingUser) {
            throw new Error("User not found");
          }

          // CHECK PASSWORD
          const isValid = await bcrypt.compare(
            credentials.password,
            existingUser.password
          );

          console.log("Password Valid:", isValid);

          if (!isValid) {
            throw new Error("Invalid password");
          }

          console.log("Login success");

          // RETURN USER
          return {
            id: existingUser._id.toString(),
            username: existingUser.username,
          };

        } catch (error) {

          console.log("=== AUTH ERROR ===");
          console.log(error);

          throw new Error(error.message);
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  callbacks: {

    async jwt({ token, user }) {

      if (user) {
        token.id = user.id;
        token.username = user.username;
      }

      return token;
    },

    async session({ session, token }) {

      session.user = {
        id: token.id,
        username: token.username,
      };

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };