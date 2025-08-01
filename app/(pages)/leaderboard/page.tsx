import prisma from "@/app/lib/database/db";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function LeaderBoard() {
    const players = await prisma.user.findMany({
        select: {
            username:true,
            rating: true
        },
        orderBy: {
            rating: "desc"
        },
        take: 10
    });
    return (
        <div className="min-h-screen max-w-screen bg-base-300 flex flex-col items-center overflow-x-hidden">
            <div className="navbar w-full justify-center">
                <div className="navbar-center">
                    <Link href={"/"} ><button type="button" className="btn btn-primary rounded-xl hover:shadow-xl transition duration-300 btn-lg">Back To Home</button> </Link>
                </div>
            </div>
            <h1 className="text-5xl font-bold text-center">Top Players</h1>
            <div className="overflow-x-auto ">
                <table className="table">
                    {/* head */}
                    <thead>
                        <tr>
                            <th className="text-center text-xl">Ranking</th>
                            <th className="text-center text-xl">Username</th>
                            <th className="text-center text-xl">Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((player,idx) => {
                            return (
                                <tr key={idx} className="bg-base-100 hover:bg-base-200 cursor-pointer">
                                    <th className="text-center">{idx+1}</th>
                                    <td className="text-center">{player.username}</td>
                                    <td className="text-center">{player.rating}</td>
                                </tr>
                            )
                        })}

                    </tbody>
                </table>
            </div>
        </div>
    )
}