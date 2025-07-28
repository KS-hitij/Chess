import { NextResponse } from "next/server";
import prisma from "@/app/lib/database/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";

export async function GET(req:Request){
    try{
        const session = await getServerSession(authOptions);
    if(!session){
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findFirst({
        where:{
            email:session.user?.email||""
        },
        select:{
            username:true
        }
    });
    if(!user){
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({user},{status:200});
    }catch(err){
        console.error(err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}