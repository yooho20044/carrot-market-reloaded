"use client"

import { XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export default function CloseModal(){
    const router = useRouter();
    const onCloseClick= () => {
        router.back();
    }
    return (
        <>
            <button onClick={onCloseClick} className="absolute right-20 top-20 text-neutral-200">
                <XMarkIcon className="size-10" />
            </button>
        </>
    )
}