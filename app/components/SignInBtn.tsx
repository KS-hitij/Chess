"use client";
import Link from "next/link";
export default function SignInBtn() {
    return (
        <button type="button" className="btn btn-primary rounded-xl hover:shadow-xl transition duration-300 lg:btn-lg"><Link href={"/auth"}>Sign In</Link></button>
    )
}