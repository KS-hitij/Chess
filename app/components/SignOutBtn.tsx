"use client";
import { signOut } from "next-auth/react";
export default function SignOutBtn() {
    const handleClick = () => {
        signOut({ callbackUrl: "/" });
    }
    return (
        <button onClick={handleClick} type="button" className="btn btn-primary  rounded-xl hover:shadow-xl transition duration-300 lg:btn-lg">Sign Out</button>
    )
}