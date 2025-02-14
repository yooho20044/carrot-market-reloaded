"use client"

import { dislikePost, likePost } from "@/app/posts/[id]/action";
import { HandThumbUpIcon as OutlineHandThumbUpIcon} from "@heroicons/react/24/outline";
import { HandThumbUpIcon as SolidHandThumbUpIcon} from "@heroicons/react/24/solid";
import { useOptimistic } from "react";

interface LikeButtonProps{
    isLiked: boolean;
    likeCount:number;
    postId: number;
}

export default function LikeButton({isLiked, likeCount, postId}: LikeButtonProps){
    const [state, reducerFn] = useOptimistic({isLiked, likeCount}, 
        (previousState,payload) => ({
            isLiked: !previousState.isLiked,
            likeCount:previousState.isLiked ?
            previousState.likeCount-1 : previousState.likeCount+1,
    })
);
    const onClick = async() => {
        reducerFn(undefined)
        if(isLiked){
            await dislikePost(postId);
        }else{
            await likePost(postId);
        }
    }
    return(
        <button
        onClick={onClick}
        className={`flex items-center gap-2 text-neutral-400 text-sm border border-neutral-400 rounded-full p-2 hover:bg-neutral-800 transition-colors
          ${state.isLiked ? "bg-orange-500 text-white border-orange-500" : "hover:bg-neutral-800"}`}
      >
      {state.isLiked ? <SolidHandThumbUpIcon className="size-5" /> : <OutlineHandThumbUpIcon className="size-5" />}
      {state.isLiked ? <span>{state.likeCount}</span> : <span>공감하기 ({state.likeCount})</span>}
      </button>
    )
}