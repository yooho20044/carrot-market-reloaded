"use client"

import { InitialChatMessages } from "@/app/chats/[id]/page"
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { formatToTimeAgo } from "@/lib/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import { ArrowUpCircleIcon } from "@heroicons/react/24/solid";
import {createClient, RealtimeChannel} from "@supabase/supabase-js"
import { saveMessage } from "@/app/chats/[id]/action";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

const SUPABASE_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlseXdjYWVzaHJkb2djcG91ZWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1MjU3NTMsImV4cCI6MjA1NTEwMTc1M30.w54vf6DW6-k1p9XYBizRrR4qlolzm3FBSgf3Aa8sepA";
const SUPABASE_URL = "https://ylywcaeshrdogcpouect.supabase.co";

interface ChatMessagesListProps{
    initialMessages: InitialChatMessages;
    userId: number;
    chatRoomId: string;
    username: string;
    avatar: string;
}

export default function ChatMessagesList({initialMessages, userId,chatRoomId, username, avatar}: ChatMessagesListProps){
    const [messages, setMessages] = useState(initialMessages);
    const [message, setMessage] = useState("");
    const channel = useRef<RealtimeChannel>();
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const{
            target:{value},
        } = event;
        setMessage(value);
    };
    const onSubmit = async(event:React.FormEvent) => {
        event.preventDefault();
        setMessages((prevMsgs) => [
            ...prevMsgs, 
            {
            id: Date.now(),
            payload: message,
            created_at: new Date(),
            userId,
            user:{
                avatar: "string",
                username: "xxx",
            },
        },
        ]);
        channel.current?.send(
           { type:"broadcast",
            event:"message",
            payload:{
                id: Date.now(),
                payload: message,
                created_at: new Date(), 
                userId,
                user:{
                    username,
                    avatar,
                }
            },
        }
        )
        await saveMessage(message, chatRoomId);
        setMessage("");
    };
    useEffect(() => {
        const client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
        channel.current = client.channel(`room-${chatRoomId}`);
        channel.current.on(
            "broadcast", {event: "message"}, (payload) => {setMessages((prevMsgs) => [...prevMsgs, payload.payload]);;}
        ).subscribe();
        return () => {
            channel.current?.unsubscribe();
        }
    }, [chatRoomId])
    
    const router = useRouter();
    const onCloseClick= () => {
        router.push("/chat");
        router.refresh();
    }
    

    return (
    <>
    <button onClick={onCloseClick} className="absolute right-20 top-2 text-neutral-200">
                <XMarkIcon className="size-10" />
    </button>
    <div className="p-5 flex flex-col gap-5 min-h-screen justify-end">
        {messages.map((message) => (
            <div key={message.id} className={`flex gap-2 items-start 
            ${message.userId === userId ? "justify-end" : ""}`}>
                {message.userId === userId ? null :
                message.user.avatar !== null ? 
                (<Image
                src={message.user.avatar!}
                alt={message.user.username}
                width={50}
                height={50}
                className="size-8 rounded-full" />) :
                (<UserIcon className="size-8"/>)
                }
                <div className={`flex flex-col gap-1 ${message.userId === userId 
                    ? "items-end" : ""}`}>
                    <span className={`p-2.5 rounded-md ${message.userId === userId 
                    ? "bg-neutral-500" : "bg-orange-500"}`}>
                        {message.payload}
                    </span>
                    <span className="text-xs">
                        {formatToTimeAgo(message.created_at.toString())}
                    </span>
                </div>
            </div>
        ))}
      <form className="flex relative" onSubmit={onSubmit}>
        <input
          required
          onChange={onChange}
          value={message}
          className="bg-transparent rounded-full w-full h-10 focus:outline-none px-5 ring-2 focus:ring-4 transition ring-neutral-200 focus:ring-neutral-50 border-none placeholder:text-neutral-400"
          type="text"
          name="message"
          placeholder="Write a message..."
        />
        <button className="absolute right-0">
          <ArrowUpCircleIcon className="size-10 text-orange-500 transition-colors hover:text-orange-300" />
        </button>
      </form>
    </div>
    </>
)}