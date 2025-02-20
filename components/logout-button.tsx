"use client";

import { logOut } from "@/app/(tabs)/profile/action";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();


    return (
        <form action={logOut}>
            <button className="primary-btn h-7 disabled:bg-neutral-400 m-1">
                Log out
            </button>
        </form>
    );
}
