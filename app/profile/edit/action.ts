"use server"

import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound } from "next/navigation";
import { profileSchema } from "./schema";

export async function getUser(){
        const session = await getSession();
        if(session.id){
            const user = await db.user.findUnique({
                where:{
                    id:session.id,
                },
            });
            if(user){
                return user;
            }
        }
        notFound();
}

export async function getUploadUrl(){
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`, 
        {
            method:"POST",
            headers:{
                "Authorization": `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
            }
        }
    );
    const data= await response.json();
    return data;
}

export async function editUser(formData:FormData){
    console.log("여기들어오니????")
    const data = {
        username: formData.get("username"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        avatar: formData.get("avatar"),
    };
    const results= profileSchema.safeParse(data);
    if(!results.success){
        console.log("씨팔 호로새끼야")
        return results.error.flatten();
    }else{
        const session = await getSession();
        if(session.id){
            console.log(results.data.avatar);
            console.log(results.data.username);
            const user = await db.user.update({
                            where: {id: session.id},
                            data:{
                                username:results.data.username,
                                phone: results.data.phone?.toString(),
                                avatar: results.data.avatar
                            }
                        });
            return { success: true };
     }else{
        return{success:false};
     }
    }
    //console.log(data);
}