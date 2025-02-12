"use client"

import { XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export default function CloseButton(){
    const router = useRouter();
    const onCloseClick= () => {
        router.push("/home");
    }
    return (
        <>
            <button onClick={onCloseClick} className="absolute right-20 top-2 text-neutral-200">
                <XMarkIcon className="size-10" />
            </button>
        </>
    )
}