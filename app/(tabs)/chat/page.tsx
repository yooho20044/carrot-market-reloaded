import DeleteChat from "@/components/delete-chat";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToTimeAgo } from "@/lib/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";

async function getChatRooms(){
    const chatRooms = await db.chatRoom.findMany({
        select:{
            id:true,
            users:true,
            created_at: true,
            messages: true,
        }
    })
    return chatRooms;
}



export default async function Chat(){
    const session = await getSession();
    const chatRooms = await getChatRooms();
    const filterChatRooms = chatRooms.filter(chatRoom => 
        chatRoom.users.some(user => 
            user.id === session.id));
    return(
        filterChatRooms.length > 0 ?(
            <div className="p-5 flex flex-col gap-5">
            {filterChatRooms.map((chatRoom, index) => 
            { const user = chatRoom.users.find(user => user.id !== session.id);
            const lastChat =[...chatRoom.messages].sort((a, b) => b.id - a.id)[0]; 

            return(
                <Link key={index} className="pb-3 flex gap-5 *:text-white" href={`/chats/${chatRoom.id}`}>
                    <div className="flex flex-row w-full gap-5">
                        <div className="size-14 rounded-full overflow-hidden bg-neutral-700">
                            {user?.avatar ? 
                            (<Image src={user.avatar} width={60} height={60} alt={user.username} />) :
                            (<UserIcon className="size-13"/>)}
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="font-semibold">{user?.username}</div>
                            <div>{lastChat?.payload}</div>
                        </div>
                        <div className="flex flex-col ml-auto">
                            <span>{formatToTimeAgo(chatRoom.created_at.toString())}</span>
                            <DeleteChat id={chatRoom.id} />
                        </div>
                    </div>
                </Link>
            )})}
        </div>
        ) : (
            <div className="flex justify-center p-5 text-xl font-semibold">참여중인 채팅이 없습니다!</div>
        )
        
    );
}