export interface LiveStreamData {
    status: string;
    thumbnail: string | null;
}

export async function fetchLiveStreamData(stream_id: string) {
    console.log("Cloudflare Account ID:", process.env.CLOUDFLARE_ACCOUNT_ID);
    console.log("Cloudflare API Token:", process.env.CLOUDFLARE_API_TOKEN);
    // ✅ 환경 변수 확인
    if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
        console.error("Cloudflare 환경 변수가 설정되지 않았습니다.");
        return { status: "error", thumbnail: null };
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs/${stream_id}/videos`;
    
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Cloudflare API 오류: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.result || data.result.length === 0) {
            return { status: "unknown", thumbnail: null };
        }

        return {
            status: data.result[0].status?.state || "unknown",
            thumbnail: data.result[0].thumbnail || null,
        };
    } catch (error) {
        console.error("Cloudflare API fetch error:", error);
        return { status: "error", thumbnail: null };
    }
}


