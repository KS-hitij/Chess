import Link from "next/link"
export default function GameOver({message}:{message:string}){
    return(
        <div className="bg-base-100 w-100 p-8 min-h-50 flex flex-col gap-y-4 rounded-2xl">
            <h1 className="text-4xl font-bold text-center">Game Over</h1>
            <h3 className="text-center">{message}</h3>
            <button type="button" className="btn btn-primary rounded-xl hover:shadow-xl transition duration-300 btn-lg"><Link href={"/"}>Return to Home</Link></button>
        </div>
    )
}