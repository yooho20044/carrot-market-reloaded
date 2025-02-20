"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";

export async function logOut() {
    const session = await getSession();
    await session.destroy();
    redirect("/");
}

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