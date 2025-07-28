"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
export default function Auth() {
    const [toast, setToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const handleContinueGoogle = async () => {
        const res = await signIn("google", {
            redirect: false,
            callbackUrl: "/"
        });
        if (res?.error) {
            setToastMessage(res.error.toUpperCase());
            setToast(true);
            setTimeout(() => setToast(false), 1500);
            return;
        }
    }
    return (
        <div className="h-screen w-screen bg-base-300 flex justify-center items-center">
            <div className="h-30 w-80 bg-base-100 rounded-2xl p-1 flex justify-center items-center">
                <button type="button" onClick={handleContinueGoogle} className="flex items-center border-1 p-4 rounded-4xl btn">
                    <Image src="https://www.google.com/favicon.ico" alt="Google" unoptimized width={32} height={12} />
                    Contine with Google
                </button>
            </div>
            <div className={`toast ${toast ? "block" : "hidden"}`}>
                <div className={`alert alert-warning ${toast ? "block" : "hidden"}`}>
                    <span className="font-semibold">{toastMessage}</span>
                </div>
            </div>
        </div>
    )
}