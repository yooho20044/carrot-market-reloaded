"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlusIcon, VideoCameraSlashIcon } from "@heroicons/react/24/solid";
import { fetchLiveStreamData, LiveStreamData } from "./action";
import { fetchLivesAction } from "./serverAction"; // ✅ 서버에서 실행되는 함수 가져옴
import { formatToTimeAgo } from "@/lib/utils";
import { UserIcon } from "@heroicons/react/24/solid";

// ✅ TypeScript 인터페이스 추가
interface LiveStream {
    id: number;
    title: string;
    stream_id: string;
    created_at: Date;
    user: {
        username: string;
        avatar: string | null;
    };
}

export default function Live() {
    const [lives, setLives] = useState<LiveStream[]>([]);
    const [streamData, setStreamData] = useState<Record<string, LiveStreamData>>({});

    // ✅ Prisma 오류 해결: 서버에서 실행되도록 변경
    useEffect(() => {
        async function fetchLives() {
            try {
                const liveStreams = await fetchLivesAction(); // ✅ 서버에서 실행되는 함수 호출
                setLives(liveStreams);
            } catch (error) {
                console.error("Error fetching lives:", error);
            }
        }
        fetchLives();
    }, []);

    // ✅ Cloudflare API에서 실시간 상태 및 썸네일 가져오기
    useEffect(() => {
        if (lives.length === 0) return;

        async function fetchStreamData() {
            const data: Record<string, LiveStreamData> = {};
            
            await Promise.all(
                lives.map(async (live) => {
                    const streamInfo = await fetchLiveStreamData(live.stream_id);
                    data[live.stream_id] = streamInfo;
                })
            );

            setStreamData(data);
        }

        fetchStreamData();
    }, [lives]);

    return (
        <div className="flex flex-col gap-5">
            {lives.map((live) => {
                const streamInfo = streamData[live.stream_id] || { status: "unknown", thumbnail: null };
                const thumbnailUrl = streamInfo.thumbnail;
                const liveStatus = streamInfo.status;

                return (
                    <Link key={live.id} className="flex flex-row w-full *:text-white gap-5" href={`/streams/${live.id}`}>
                        {/* ✅ 썸네일 이미지 렌더링 */}
                        <div style={{ width: 200, height: 130 }} className="flex justify-center items-center rounded-md overflow-hidden bg-neutral-500">
                            {thumbnailUrl ? (
                                <Image
                                    src={thumbnailUrl}
                                    className="object-cover h-full w-full"
                                    width={200}
                                    height={200}
                                    alt={live.title}
                                />
                            ) : (
                                <>
                                    <VideoCameraSlashIcon className="w-20" />
                                    <div className="text-neutral-400 text-sm">방송준비중</div>
                                </>
                            )}
                        </div>

                        {/* ✅ 방송 정보 표시 */}
                        <div className="flex flex-col justify-center gap-3">
                            <div className="flex flex-row gap-2">
                                <span className="text-2xl font-semibold">{live.title}</span>
                                {liveStatus === "live-inprogress" && (
                                    <div className="h-5 flex items-center gap-1 p-1 bg-neutral-500">
                                        <div className="rounded-full w-2 h-2 bg-red-500" />
                                        <span className="text-sm">LIVE</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                {live.user.avatar !== null ?
                                (<Image
                                    width={28}
                                    height={28}
                                    className="size-7 rounded-full"
                                    src={live.user.avatar!}
                                    alt={live.user.username}
                                />) :
                                (<UserIcon className="size-7"/>)}
                                <span>{live.user.username}</span>
                            </div>
                        </div>

                        {/* ✅ 업로드 시간 표시 */}
                        <div className="flex ml-auto pt-3">
                            <span className="text-sm">{formatToTimeAgo(String(live.created_at))}</span>
                        </div>
                    </Link>
                );
            })}

            {/* ✅ 방송 추가 버튼 */}
            <Link href="/streams/add" className="bg-orange-500 flex items-center justify-center rounded-full size-16 fixed bottom-24 right-8 text-white transition-colors hover:bg-orange-400">
                <PlusIcon className="size-10" />
            </Link>
        </div>
    );
}
