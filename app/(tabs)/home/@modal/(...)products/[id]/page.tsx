import CloseModal from "@/components/close-modal"; 
import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { UserIcon } from "@heroicons/react/24/solid";
import { formatToWon } from "@/lib/utils";
import Link from "next/link";
import { unstable_cache as nextCache, revalidatePath, revalidateTag } from "next/cache";

async function getIsOwner(userId:number){
    const session = await getSession();
    if(session.id){
        return session.id === userId
    }
    return false;
}

async function getProduct(id: number){
    const product = await db.product.findUnique({
        where:{
            id,
        },
        include:{
            user:{
                select:{
                    username: true,
                    avatar: true,
                }
            }
        }
    });
    return product;
}

const getCachedProduct = nextCache(getProduct, ["product-detail"], {
    tags: ["product-detail", "xxxx"],
});

export default async function Modal({
    params
}:{params:{id: string}}){
    const id = Number(params.id);
        if(isNaN(id)){
            return notFound();
        }
    const product = await getCachedProduct(id);
    if(!product){
        return notFound();
    }
    const isOwner = await getIsOwner(product.userId);

    revalidateTag("product-detail");

    const createChatRoom = async() => {
        "use server";
        const session = await getSession();
        const room = await db.chatRoom.create({
            data:{
                users:{
                    connect:[
                        {
                            id:product.userId,
                        },
                        {
                            id:session.id,
                        },
                    ],
                },
            },
            select:{
                id:true,
            }
        });
        redirect(`/chats/${room.id}`);
    }

    return ( 
        <div className="absolute w-full h-full z-50 flex justify-center items-center bg-black left-0 top-0 bg-opacity-60">
            <CloseModal />
            <div className="max-w-screen-sm flex justify-center w-full h-1/2">
                <div className="relative aspect-square bg-neutral-700 text-neutral-200 rounded-md flex justify-center items-center">
                    <Image fill src={`${product.photo}/width=400,height=400`} className="object-cover" alt={product.title}/>
                </div>
            </div>
            <div className="flex flex-col gap-10">
                <div className="p-5 flex flex-row items-center gap-3 border-b border-neutral-700">
                    <div className="size-10 rounded-full overflow-hidden">
                        {product.user.avatar !== null ?
                        (<Image src={product.user.avatar} width={40} height={40} alt={product.user.username} />) :
                        (<UserIcon className="size-10"/>)
                        }
                    </div>
                    <div>
                        <h3>{product.user.username}</h3>
                    </div>
                </div>
                <div className="p-5 flex flex-col gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{product.title}</h1>
                        <p className="pt-2">{product.description}</p>
                    </div>
                    <div className="fixed w-full bottom-0 left-0 p-5 pb-10 bg-neutral-800 flex justify-between items-center">
                        <span className="font-semibold text-xl">{formatToWon(product.price)}원</span>
                        {isOwner ? 
                        (
                        <Link href={`/products/edit/${product.id}`} className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold">제품 수정하기</Link>
                        ):
                        (
                        <form action={createChatRoom}>
                            <button className="bg-orange-500 px-5 py-2.5 rounded-md text-white font-semibold">채팅하기</button>
                        </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}