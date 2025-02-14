"use client"
import { deleteChatRooms } from "@/app/chats/[id]/action";
import { TrashIcon } from "@heroicons/react/24/outline";
import {useRouter} from "next/navigation";



export default function DeleteChat({id}: {id:string}){
    const router = useRouter();

    const handleDelete = async() => {
        const result = await deleteChatRooms(id);
        if(result.success){
            alert("채팅방이 삭제되었습니다.");
            router.replace("/chat");
            setTimeout(() => router.refresh(), 100);
        }
    }

    return(
        <>
            <button onClick={handleDelete} className="ml-auto p-3">
                <TrashIcon className="text-red-500 size-5" />
            </button>
        </>
    )
}