"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";

export async function likePost(postId: number){
    //await new Promise((r) => setTimeout(r, 10000));
    const session = await getSession();
    try{
        await db.like.create({
            data:{
                    postId,
                    userId: session.id!,
            }
        })
        revalidateTag(`like-status-${postId}`);
    }catch(e){}
};

export async function dislikePost(postId: number){
    //await new Promise((r) => setTimeout(r, 10000));
    const session = await getSession();
    try{
        await db.like.delete({
            where:{
                id:{
                    postId,
                    userId: session.id!,
                }
            }
        })  
        revalidateTag(`like-status-${postId}`);
    }catch(e){}
};

// export async function getCachedPostComment(prevState:any, formData: FormData){
//     const postId = Number(formData.get("postId"));
//     const cachedOperation = nextCache(postComment, ["post-comment"], {
//         tags: [`post-comment-${postId}`],
//     }); 
//     return cachedOperation(null, formData);
// }

// async function postComment(prevState:any, formData:FormData){
//     const session = await getSession();
//     const payload = formData.get("payload") as String | null;
//     const postId = Number(formData.get("postId"));

//     if(!payload){
//         return{error:"댓글 내용을 입력하세요."};
//     }

//     try{
//         await db.comment.create({
//             data: {
//                 payload:payload.trim(),
//                 postId,
//                 userId: session.id!
//             }
//         })
//         revalidateTag(`post-comment-${postId}`);
//     }catch(e){}
    
// }

export async function getCachedPostComment(
    prevState: { error: string | null; success: boolean } | null, // ✅ useFormState와 완벽하게 일치
    formData: FormData
): Promise<{ error: string | null; success: boolean }> { // ✅ 반환 타입도 useFormState와 동일하게 맞춤
    const session = await getSession();
    if (!session?.id) {
        return { error: "로그인이 필요합니다.", success: false };
    }

    const postId = Number(formData.get("postId"));
    const payload = formData.get("payload") as string | null;

    if (!payload || !payload.trim()) {
        return { error: "댓글 내용을 입력하세요.", success: false };
    }

    await db.comment.create({
        data: {
            payload: payload.trim(),
            postId,
            userId: session.id,
        },
    });

    return { success: true, error: null }; // ✅ useFormState의 요구사항에 맞게 반환
}

export async function deleteComment(id:number){
    const deleteComment= await db.comment.delete({
        where:{
            id
        }
    })
    return {success: true};
}


