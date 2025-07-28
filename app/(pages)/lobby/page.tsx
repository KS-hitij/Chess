"use client";
import Link from "next/link";
import { useState } from "react";
import { v4 as uuid } from "uuid"
export default function Lobby(){
    const [roomId,setRoomId] = useState("");
    const generateId = ()=>{
        const id = uuid();
        setRoomId(id);
        alert("Share room id with your friend before joining.");
    }
    return(
        <div className="h-screen w-screen bg-base-300 flex items-center justify-center">
            <div className="bg-base-100 min-h-60 min-w-90 max-w-100 p-5 rounded-2xl flex flex-col items-center gap-4 justify-center">
                <input type="text" value={roomId} onChange={(e)=>setRoomId(e.target.value)} placeholder="Room Id" className="input"  />
                <button onClick={generateId} type="button" className="btn btn-primary rounded-xl hover:shadow-xl transition duration-300 btn-lg">Genrate Id</button>
                <button type="button" className="btn btn-primary rounded-xl hover:shadow-xl transition duration-300 btn-lg"><Link href={`/game/private/${roomId}`}>Join</Link></button>
            </div>
        </div>
    )
}