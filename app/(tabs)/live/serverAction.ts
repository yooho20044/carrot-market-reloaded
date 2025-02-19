"use server"; // ✅ 서버에서만 실행되도록 설정

import db from "@/lib/db";

export interface LiveStream {
    id: number;
    title: string;
    stream_id: string;
    created_at: Date;
    user: {
        username: string;
        avatar: string | null;
    };
}

// ✅ 서버 전용 함수 (Prisma 실행)
export async function getLives(): Promise<LiveStream[]> {
    return await db.liveStream.findMany({
        select: {
            id: true,
            title: true,
            stream_id: true,
            created_at: true,
            user: {
                select: {
                    username: true,
                    avatar: true,
                },
            },
        },
    });
}

// ✅ 클라이언트에서 안전하게 호출할 수 있도록 래핑
export async function fetchLivesAction() {
    return await getLives();
}
