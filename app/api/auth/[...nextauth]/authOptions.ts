import GoogleProvider from "next-auth/providers/google";
import prisma from "@/app/lib/database/db";
import { AuthOptions } from "next-auth";
const authOptions:AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        })
    ],
    secret:process.env.NEXT_AUTH_SECRET || "",
    callbacks: {
        async signIn({ account, profile }) {
            if (account?.provider === "google") {
                const email = profile?.email;
                const name = profile?.name;
                const username = `${name?.split(' ')[0]}${crypto.randomUUID().split('-')[0]}`;
                try {
                    const existingUser = await prisma.user.findFirst({
                        where: { email }
                    });
                    if (existingUser) {
                        return true;
                    }
                    await prisma.user.create({
                        data: {
                            email: email || "",
                            username,
                            name: name || "",
                        }
                    })
                    return true;
                }catch(err){
                    console.error(err);
                    return false;
                }
            }
            return false;
        },
        async jwt({token,profile}){
            if(profile){
                token.email = profile.email;
            }
            return token;
        },
        async session({session,token}){
            if(token){
                if(session.user)
                    session.user.email = token.email;
            }
            return session;
        }
    },
    
    session:{
        strategy:"jwt"
    }
}
export {authOptions};