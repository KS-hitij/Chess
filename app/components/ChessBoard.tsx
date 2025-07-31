"use client";
import { useEffect, useRef, useState } from "react";
import { Chessboard, ChessboardOptions } from "react-chessboard";
import { Chess, Square } from "chess.js";
import useSound from 'use-sound';
type ChessMove = {
    from:string,
    to:string
}
export default function ChessBoard({socket,roomId,color}:{socket:WebSocket,roomId:string,color:"white"|"black"|undefined}) {
    const [move] = useSound("/sounds/chess move.mp3");
    const [check] = useSound("/sounds/check.mp3");
    const chessGameRef = useRef(new Chess());
    const [chessPoition, setChessPosition] = useState(chessGameRef.current.fen());
    const [activeSquare, setActiveSquare] = useState<string | null>(null);
    const [highlightedSquares, setHighlightedSquares] = useState<{ [square: string]: React.CSSProperties }>({});
    useEffect(()=>{
        socket.addEventListener("message",(e:MessageEvent)=>{
            const data = JSON.parse(e.data);
            if(data.type==="board"){
                move();
                setChessPosition(data.payload.board);
                chessGameRef.current.load(data.payload.board);
            }
            if(data.type==="check"){
                check();
            }
        })
    },)
    const chessoptions: ChessboardOptions = {
        showAnimations: true,
        allowDragging: true,
        position: chessPoition,
        squareStyles: highlightedSquares,
        boardOrientation:color,
        onSquareClick:({ square })=> {
            if (activeSquare) {
                const moves:ChessMove[] = getMoveOptions(activeSquare as Square);
                const foundMove = moves.find((move) => move.from === activeSquare && move.to === square);
                if (foundMove) {
                    chessGameRef.current.move({
                        from: activeSquare,
                        to: square,
                        promotion:"q"
                    });
                    socket.send(JSON.stringify({type:"move",payload:{from:activeSquare,to:square,roomId}}));
                    setActiveSquare(null);
                    setHighlightedSquares({});
                    return;
                }
            }
            const moves:ChessMove[] = getMoveOptions(square as Square);
            if (square !== activeSquare) {
                if (moves.length === 0) {
                    setActiveSquare(null);
                    setHighlightedSquares({});
                    return;
                }
                const highlights: { [square: string]: React.CSSProperties } = {};
                moves.forEach((move) => {
                    highlights[move.to] = {
                        background:
                            chessGameRef.current.get(move.to as Square)
                                ? "radial-gradient(circle, rgba(255,0,0,0.6) 60%, transparent 60%)"
                                : "radial-gradient(circle, rgba(0,0,0,0.3) 20%, transparent 20%)",
                        borderRadius: "50%",
                    }
                })
                highlights[square] = {
                    backgroundColor: "rgba(0, 255, 0, 0.4)",
                };
                setActiveSquare(square);
                setHighlightedSquares(highlights);
                return;
            }
        },
        onPieceDrop:({sourceSquare,targetSquare})=>{
            if(!sourceSquare){
                return false;
            }
            if (sourceSquare && targetSquare) {
                const moves:ChessMove[] = getMoveOptions(sourceSquare as Square);
                const foundMove = moves.find((move) => move.from === sourceSquare && move.to === targetSquare);
                if (foundMove) {
                    chessGameRef.current.move({
                        from: sourceSquare,
                        to: targetSquare,
                        promotion:"q"
                    });
                    socket.send(JSON.stringify({type:"move",payload:{from:sourceSquare,to:targetSquare,roomId}}));
                    setActiveSquare(null);
                    setHighlightedSquares({});
                    return true;
                }
            }
            return false;
        }
    };

    const getMoveOptions = (square: Square) => {
        const moves = chessGameRef.current.moves({ square, verbose: true });
        return moves;
    }
    return (
        <Chessboard options={chessoptions} />
    )
}