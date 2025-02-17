import db from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { EyeIcon } from "@heroicons/react/24/solid";
import { formatToTimeAgo } from "@/lib/utils";
import getSession from "@/lib/session";
import { unstable_cache as nextCache} from "next/cache";
import LikeButton from "@/components/like-button";
import TabBar from "@/components/tab-bar";
import { UserIcon } from "@heroicons/react/24/solid";
import Comment from "@/components/comment";
import { Comment as PrismaComment } from "@prisma/client";
import { XMarkIcon } from "@heroicons/react/24/solid";
import CloseButton from "@/components/close-button";

// ✅ 커스텀 타입: `PrismaComment`에 `user` 필드 추가
type ExtendedComment = PrismaComment & {
    user: {
        username: string;
        avatar: string | null;
    };
};

// ✅ 댓글 가져오기 (user 정보 포함)
async function getComments(id: number): Promise<ExtendedComment[]> {
    const comments = await db.comment.findMany({
        where: { postId: id },
        include: { 
            user: {
                select: {
                    username: true,
                    avatar: true,
                },
            },
        },
    });
    return comments;
}

async function getPost(id:number){
    try{
        const post = await db.post.update({
            where:{
                id,
            },
            data:{
                views:{
                    increment: 1,
                },
            },
            include:{
                user:{
                    select:{
                        username:true,
                        avatar:true,
                    },
                },
                _count:{
                    select:{
                        comments: true,
                    },
                },
            },
        })
        return post;
    }catch(e){
        return null;
    }
}

// async function getComments(id:number):Promise<PrismaComment[]>{
//         const comments = await db.comment.findMany({
//             where:{
//                 postId: id,
//             },
//             select:{
//                 id: true,
//                 payload: true,
//                 created_at: true,
//                 updated_at: true,
//                 userId: true,
//                 postId: true,
//                 user:{
//                     select:{
//                         username: true,
//                         avatar: true,
//                     }
//                 },
//             }
//         });
//         return comments;
// }

async function getCachedPost(postId: number) {
    const cachedOperation = nextCache(getPost, ["post-detail"],{
        tags:[`post-detail-${postId}`],
        revalidate:60,
    });
    return cachedOperation(postId);
}



async function getLikeStatus(postId:number, userId:number){
    //const session = await getSession();
    const isLiked = await db.like.findUnique({
        where:{
            id:{
                postId,
                userId: userId,
            },
        },
    });
    const likeCount = await db.like.count({
        where:{
            postId,
        },
    });

    return{
        likeCount, 
        isLiked: Boolean(isLiked),
    }
}
async function getCachedLikeStatus(postId: number){
    const session = await getSession();
    const userId = session.id;
    const cachedOperation = nextCache(getLikeStatus, ["product-like-status"], {
        tags: [`like-status-${postId}`],
    }); 
    return cachedOperation(postId, userId!);
}



export default async function PostDetail({params}: {params:{id:string}}){
    const session = await getSession();
    const userId = session.id;
    const id = Number(params.id)
    if(isNaN(id)){
        return notFound();
    }
    const post = await getCachedPost(id);
    if(!post){
        return notFound();
    }
    const {likeCount, isLiked} = await getCachedLikeStatus(id);
    const comments = await getComments(id);
    // ✅ `userId`가 있을 경우 Prisma에서 유저 정보 가져오기
    let userInfo: { username: string; avatar: string | null } | undefined = undefined;

    if (userId) {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                username: true,
                avatar: true,
            },
        });

        if (user) {
            userInfo = {
                username: user.username,
                avatar: user.avatar,
            };
        }
    }


    return (
        <div className="p-5 text-white">
        <CloseButton path="/life" />
        <div className="flex items-center gap-2 mb-2">
        {post.user.avatar !== null ?
        (<Image
            width={28}
            height={28}
            className="size-7 rounded-full"
            src={post.user.avatar!}
            alt={post.user.username}
          />) :
          (<UserIcon className="size-7"/>)}
          <div>
            <span className="text-sm font-semibold">{post.user.username}</span>
            <div className="text-xs">
              <span>{formatToTimeAgo(post.created_at.toString())}</span>
            </div>
          </div>
        </div>
        <h2 className="text-lg font-semibold">{post.title}</h2>
        <p className="mb-5">{post.description}</p>
        <div className="flex flex-col gap-5 items-start pb-5 border-b border-neutral-300">
          <div className="flex items-center gap-2 text-neutral-400 text-sm">
            <EyeIcon className="size-5" />
            <span>조회 {post.views}</span>
          </div>
            <LikeButton isLiked={isLiked} likeCount={likeCount} postId={id}/>
        </div>
        <div className="border-b border-neutral-200 p-2 text-sm font-semibold">
            <span>댓글 {post._count.comments}개</span>
        </div>
        <Comment userId={Number(session.id)} userInfo={userInfo} postId={id} comments={comments} />
        <TabBar />
      </div>
    )
}


