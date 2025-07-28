import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import prisma from "@/app/lib/database/db";
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const change = await req.json();
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const email = session.user?.email;
        if (!email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const existingUser = await prisma.user.findFirst({
            where: {
                email: email
            }
        });
        if (!existingUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        if (existingUser.rating === 0 && change < 0) {
            return NextResponse.json({ message: "Rating Updated" }, { status: 200 });
        }
        if (existingUser.rating - change < 0) {
            await prisma.user.update({
                where: {
                    email
                },
                data: { rating: 0 }
            });
            return NextResponse.json({ message: "Rating Updated" }, { status: 200 });
        }
        await prisma.user.update({
            where: {
                email
            },
            data: {
                rating: { increment: change }
            }
        });
        return NextResponse.json({ message: "Rating Updated" }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}