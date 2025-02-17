"use client"

import { XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

interface CloseButtonProps{
    path: string;
}

export default function CloseButton({path}: CloseButtonProps){
    const router = useRouter(); // ✅ 클라이언트에서만 실행

    const handleClose = () => {
        if(!path){
            console.error("path가 undefined");
        }
        router.push(path); // ✅ 전달받은 경로로 이동
    };

    return (
        <>
            <button onClick={handleClose} className="absolute right-20 top-2 text-neutral-200">
                <XMarkIcon className="size-10" />
            </button>
        </>
    )
}