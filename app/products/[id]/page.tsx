import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { formatToWon } from "@/lib/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";
import CloseButton from "@/components/close-button";


async function getIsOwner(userId:number){
    const session = await getSession();
    if(session.id){
        return session.id === userId
    }
    return false;
}

async function getProduct(id:number){
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
};

const getCachedProduct = nextCache(getProduct, ["product-detail"], {
    tags: ["product-detail", "xxxx"],
});

export async function getProductTitle(id:number){
    const product = await db.product.findUnique({
        where:{
            id,
        },
        select:{
            title:true,
        }
    });
    return product;
};

const getCachedProductTitle= nextCache(getProductTitle, ["product-title"], {
    tags: ["product-title", "xxxx"],
});

export async function generateMetadata({params,}: {params: {id:string};}){
    const product = await getCachedProductTitle(Number(params.id))
    return{
        title: product?.title,
    }
}

export default async function ProductDetail({params,}: {params: {id:string};}){
    const id = Number(params.id);
    if(isNaN(id)){
        return notFound();
    }
    const product = await getCachedProduct(id);
    if(!product){
        return notFound();
    }
    const isOwner = await getIsOwner(product.userId);
    
    //cache 새로고침
    revalidateTag("xxxx");
        
    return (
        <div>
            <CloseButton />
            <div className="relative aspect-square">
                <Image fill src={`${product.photo}/width=500,height=500`} className="object-cover" alt={product.title} />
            </div>
            <div className="p-5 flex items-center gap-3 border-b border-neutral-700">
                <div className="size-10 overflow-hidden rounded-full">
                    {product.user.avatar !== null ? 
                    (<Image src={product.user.avatar} width={40} height={40} alt={product.user.username} />) :
                    (<UserIcon className="size-10"/>)}
                </div>
                <div>
                    <h3>{product.user.username}</h3>
                </div>
            </div>
            <div className="p-5">
                <h1 className="text-2xl font-semibold">{product.title}</h1>
                <p>{product.description}</p>
            </div>
            <div className="fixed w-full bottom-0 left-0 p-5 pb-10 bg-neutral-800 flex justify-between items-center">
                <span className="font-semibold text-xl">{formatToWon(product.price)}원</span>
                {isOwner ? 
                (
                <Link href={`/products/edit/${product.id}`} className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold">제품 수정하기</Link>
                ):
                (<Link className="bg-orange-500 px-5 py-2.5 rounded-md text-white font-semibold" href={``}>채팅하기</Link>)}
            </div>
        </div>
    )
}

export const dynamicParams = true;

export async function generateStaticParams(){
    const products = await db.product.findMany({
        select:{
            id:true,
        }
    })
    return products.map((product) => {
        return{
            id:product.id + "",
        };
    });
}