"use server"

import { z } from "zod";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";


const postSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요").max(100, "제목은 50자 이내여야 합니다."),
    description: z.string().min(10, "내용을 10자 이상 입력해주세요"),
});


export async function uploadPost(formData:FormData){
    const data = {
        title: formData.get("title"),
        description: formData.get("description"),
    };

    const results = postSchema.safeParse(data);
    if(!results.success){
        return results.error.flatten();
    }else{
        const session = await getSession();
        if(session.id){
            const post = await db.post.create({
                data:{
                    title: results.data.title,
                    description:results.data.description,
                    user:{
                        connect:{
                            id: session.id
                        }
                    }
                },
                select:{
                    id: true,
                }
            });
            redirect(`/posts/${post.id}`)
        }
    }
}