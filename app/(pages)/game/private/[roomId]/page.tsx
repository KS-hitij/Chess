"use client";
import { useState, useEffect, useRef } from "react";
import ChessBoard from "../../../../components/ChessBoard";
import GameOver from "../../../../components/GamOver";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";


export default function Game() {
  const router = useRouter();
  const params = useParams();
  const socketRef = useRef<WebSocket | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState("");
  const [color, setColor] = useState<"white" | "black">();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [movesHistory, setMovesHistory] = useState<string[]>([]);
  const [opponentName, setOpponentName] = useState("");
  const [playerName, setPlayerName] = useState("");
  useEffect(() => {
    let isMounted = true;
    const setUp = async () => {
      try {
        const response = await axios.get("/api/player");
        if (response.status === 401) {
          router.push("/auth");
          return;
        }

        if (isMounted) {
          setPlayerName(response.data.user.username);
        }

        const ws = new WebSocket(process.env.NEXT_PUBLIC_BACKEND_URL || "ws://localhost:3001/");
        socketRef.current = ws;

        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              type: "join_private",
              payload: {
                roomId: params.roomId,
                name: response.data.user.username,
              },
            })
          );
        };

        ws.onmessage = (data: MessageEvent) => {
          if (!isMounted) return;

          try {
            const parsedData = JSON.parse(data.data);

            switch (parsedData.type) {
              case "init_game":
                setRoomId(parsedData.payload.roomId);
                setColor(parsedData.payload.color);
                setOpponentName(parsedData.payload.opponent);
                setLoading(false);
                break;

              case "error":
                setToastMessage(parsedData.payload.message);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 1500);
                break;

              case "win":
              case "lose":
                setTimeout(() => {
                  setToastMessage(parsedData.payload.message);
                  setGameOver(true);
                }, 700);
                break;

              case "history":
                setMovesHistory(parsedData.payload.history);
                break;

              default:
                console.warn("Unknown message type:", parsedData.type);
            }
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          if (isMounted) {
            setToastMessage("Connection error");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 1500);
          }
        };

        ws.onclose = () => {
          if (isMounted && !gameOver) {
            setToastMessage("Connection closed");
            setShowToast(true);
            setTimeout(() => {
              setShowToast(false);
              setLoading(true);
            }, 1500);
          }
        };
      } catch (error) {
        console.error("Setup error:", error);
        if (isMounted) {
          setToastMessage("Failed to initialize game");
          setShowToast(true);
          setTimeout(() => setShowToast(false), 1500);
        }
      }
    };

    setUp();

    return () => {
      isMounted = false;
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen gap-y-4 flex flex-col justify-center items-center">
        <h1 className="text-3xl font-semibold">Finding A Match</h1>
        <span className="loading loading-dots loading-xl"></span>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-base-300">
        <GameOver message={toastMessage} />
      </div>
    );
  }

  if (socketRef.current) {
    return (
      <div className="lg:h-screen h-screen max-w-screen overflow-y-auto flex lg:flex-row flex-col lg:py-6 lg:items-center lg:justify-around lg:px-18 bg-base-300">
        <div className="lg:absolute top-0 max-w-screen navbar">
          <h1 className="navbar-start">{playerName}</h1>
          <h1 className="navbar-end">{opponentName}</h1>
        </div>
        <div className="max-h-full max-w-full aspect-square">
          <ChessBoard socket={socketRef.current} roomId={roomId} color={color} />
        </div>
        <div className="moves w-full lg:w-[18%] bg-base-200 rounded-2xl p-2 h-full lg:h-[90%] overflow-y-auto flex flex-col items-center gap-y-3">
          <h1 className="text-xl font-bold">Moves Played</h1>
          <div className="flex flex-col w-full justify-center gap-4">
            {Array.from({ length: Math.ceil(movesHistory.length / 2) }).map((_, idx) => {
              const move1 = movesHistory[idx * 2];
              const move2 = movesHistory[idx * 2 + 1];
              return (
                <div key={idx} className="w-full flex justify-center gap-x-4">
                  <h3 className="text-lg font-semibold">{move1 || "-"}</h3>
                  <h3 className="text-lg font-semibold">{move2 || "-"}</h3>
                </div>
              );
            })}
          </div>
        </div>
        <div className={`toast toast-top toast-end ${showToast ? "block" : "hidden"}`}>
          <div className="alert alert-error">
            <span>{toastMessage}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}