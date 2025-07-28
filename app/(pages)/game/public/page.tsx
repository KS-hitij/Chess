"use client";
import { useState, useEffect } from "react";
import ChessBoard from "../../../components/ChessBoard";
import GameOver from "../../../components/GamOver";
import axios from "axios";
import { useRouter } from "next/navigation";
type GameMessage = {
    type:"win" | "lose" | "init_game" | "error" | "history",
    payload:{
        roomId?:string,
        opponent?:string,
        color?: string,
        message?:string,
        history?:string[]
    }
}
export default function Game() {
    const router = useRouter();
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [loading, setLoading] = useState(true);
    const [roomId, setRoomId] = useState("");
    const [color, setColor] = useState<undefined | "white" | "black">(undefined);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [gameOver, setGameOver] = useState(false);
    const [movesHistory, setMovesHistory] = useState<string[]>([]);
    const [opponentName,setOpponentName] = useState("");
    const [playerName,setPlayerName] = useState("");
    async function changeRating(parsedData:GameMessage) {
        if (parsedData.type === "win") {
            await axios.put("/api/rating", { change: 30 });
        }else{
            await axios.put("/api/rating", { change: -30 });
        }
    }
    useEffect(() => {
        async function setUp() {
            const response = await axios.get("/api/player");
            if(response.status==401){
                router.push("/auth");
            }else if(response.status==200){
                setPlayerName(response.data.user.username);
            }
            const ws = new WebSocket(process.env.BACKEND_URL || "ws://localhost:3001/");
            setSocket(ws);
            ws.onopen = () => {
                ws.send(JSON.stringify({ type: "join_public",name:response.data.user.username }));
            }
            ws.onmessage = (data: MessageEvent) => {
                const parsedData = JSON.parse(data.data);
                if (parsedData.type === "init_game") {
                    setRoomId(parsedData.payload.roomId);
                    setColor(parsedData.payload.color);
                    setOpponentName(parsedData.payload.opponent);
                    setLoading(false);
                }
                if (parsedData.type === "error") {
                    setToastMessage(parsedData.payload.message);
                    setShowToast(true);
                    setTimeout(() => {
                        setShowToast(false);
                    }, 1500);
                }
                if (parsedData.type === "win" || parsedData.type === "lose") {
                    setTimeout(() => {
                        setToastMessage(parsedData.payload.message);
                        setGameOver(true);
                    }, 700)
                    changeRating(parsedData);
                }
                if (parsedData.type === "history") {
                    setMovesHistory(parsedData.payload.history);
                }
            }
        }
        setUp();
        return () => {
            if(socket)
                socket.close();
        }
    }, )
    if (loading) {
        return (
            <div className="h-screen w-screen gap-y-4 flex flex-col justify-center items-center">
                <h1 className="text-3xl font-semibold">Finding A Match</h1>
                <span className="loading loading-dots loading-xl"></span>
            </div>
        )
    }
    if (gameOver) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-base-300">
                <GameOver message={toastMessage} />
            </div>
        )
    }
    if (socket)
        return (
            <div className="lg:h-screen h-screen max-w-screen overflow-y-auto flex lg:flex-row flex-col lg:py-6 lg:items-center lg:justify-around lg:px-18 bg-base-300">
                <div className="lg:absolute top-0 max-w-screen navbar">
                    <h1 className="navbar-start">{playerName}</h1>
                    <h1 className="navbar-end">{opponentName}</h1>
                </div>
                <div className="max-h-full max-w-full aspect-square">
                    <ChessBoard socket={socket} roomId={roomId} color={color} />
                </div>
                <div className="moves w-full lg:w-[18%] bg-base-200 rounded-2xl p-2 h-full lg:h-[90%] overflow-y-scroll flex flex-col items-center gap-y-3">
                    <h1 className="text-xl font-bold">Moves Played</h1>
                    <div className="flex flex-col w-full justify-center gap-4">
                        {Array.from({ length: Math.ceil(movesHistory.length / 2) }).map((_, idx) => {
                            const move1 = movesHistory[idx * 2];
                            const move2 = movesHistory[idx * 2 + 1];
                            return (
                                <div key={idx} className="w-full flex justify-center gap-x-4">
                                    <h3 className="text-lg font-semibold">{move1}</h3>
                                    <h3 className="text-lg font-semibold">{move2}</h3>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className={`toast toast-top toast-end ${showToast ? "block" : "hidden"}`}>
                    <div className="alert alert-error">
                        <span>{toastMessage}</span>
                    </div>
                </div>
            </div>
        )
}