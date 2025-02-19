"use client";

import { deleteComment, getCachedPostComment } from "@/app/posts/[id]/action";
import { useState } from "react";
import { useFormState } from "react-dom";
import Image from "next/image";
import { formatToTimeAgo } from "@/lib/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

// ✅ Prisma 모델과 정확히 일치하는 Comment 타입
interface Comment {
    id: number;
    payload: string;
    created_at: Date;
    updated_at: Date;
    userId: number;
    postId: number;
    user: {
        username: string;
        avatar: string | null;
    };
}

export default function Comment({ postId, comments = [], userId, userInfo }: { postId: number; comments: Comment[]; userId: number | null; userInfo?: { username: string; avatar: string | null } }) {
    const [comment, setComment] = useState("");
    const [optimisticComments, setOptimisticComments] = useState<Comment[]>(comments); // ✅ 최신 댓글 상태 유지
    const [state, dispatch] = useFormState(getCachedPostComment, { error: null, success: false });
    const router = useRouter();

    // ✅ 댓글 삭제 핸들러
    const handleDelete = async (commentId: number) => {

        const result = await deleteComment(commentId);
        if (result.success) {
            // ✅ 삭제된 댓글을 UI에서 즉시 제거
            setOptimisticComments((prev) => prev.filter((comment) => comment.id !== commentId));

            // ✅ 페이지 새로고침 (100ms 후 실행)
            setTimeout(() => router.refresh(), 100);
        } else {
            alert("댓글 삭제에 실패했습니다.");
        }
    };

    return (
        <>
            {/* ✅ `optimisticComments`가 업데이트된 상태를 즉시 반영 */}
            {optimisticComments.map((comment: Comment, index) => (
                <div className="flex flex-col border-b border-dashed border-neutral-300" key={comment.id || index}>
                    <div className="flex flex-row mt-3 gap-2 items-center">
                        {comment.user?.avatar ? (
                            <Image width={28} height={28} className="size-7 rounded-full" src={comment.user.avatar} alt={comment.user.username} />
                        ) : (
                            <UserIcon className="size-7" />
                        )}
                        <span className="text-sm font-semibold">{comment.user?.username || "익명"}</span>
                        <div className="text-xs">
                            <span>{formatToTimeAgo(comment.created_at?.toString() || new Date().toString())}</span>
                        </div>

                        {/* ✅ 댓글 삭제 버튼 (본인만 삭제 가능) */}
                        {userId === comment.userId && (
                            <div className="ml-auto">
                                <button onClick={() => handleDelete(comment.id)} className="ml-auto p-3">
                                    <TrashIcon className="text-red-500 size-5" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="py-3 pl-3">
                        <p>{comment.payload}</p>
                    </div>
                </div>
            ))}

            {/* ✅ 댓글 입력 폼 */}
            {userId ? ( // ✅ 로그인한 경우만 폼을 보여줌
                <form
                    action={(formData) => {
                        if (!userId || !userInfo) {
                            alert("로그인이 필요합니다.");
                            return;
                        }

                        const newComment: Comment = {
                            id: Date.now(),
                            payload: comment,
                            created_at: new Date(),
                            updated_at: new Date(),
                            userId: userId,
                            postId: postId,
                            user: {
                                username: userInfo.username, // ✅ `userInfo`에서 가져옴
                                avatar: userInfo.avatar, // ✅ `userInfo`에서 가져옴
                            },
                        };

                        // ✅ `setOptimisticComments()`를 이용하여 즉시 UI에 추가
                        setOptimisticComments((prev) => [...prev, newComment]); // ✅ 최신 댓글을 맨 아래 추가

                        // ✅ `dispatch(formData)`를 실행하여 서버에 데이터 전송
                        dispatch(formData);

                        // ✅ `setComment("")`를 나중에 실행하여 입력 필드 초기화
                        setTimeout(() => setComment(""), 50);
                    }}
                >
                    <div className="flex flex-col mt-5 p-3 gap-1 justify-between border border-neutral-500">
                        <span>댓글 쓰기</span>
                        <div className="flex flex-row items-center py-2 gap-1">
                            <textarea className="bg-transparent rounded-md w-full h-20" placeholder="회원 간의 불편함을 주는 댓글은 자제해주시고 따뜻한 댓글 부탁드립니다." name="payload" value={comment} onChange={(e) => setComment(e.target.value)} />
                            <input type="hidden" name="postId" value={postId.toString()} />
                            <input type="hidden" name="userId" value={userId?.toString() || ""} /> {/* ✅ userId 전달 */}
                            <button className="primary-btn h-10 w-20">등록</button>
                        </div>
                    </div>
                </form>
            ) : (
                <p className="text-sm text-gray-400 mt-5">댓글을 작성하려면 로그인하세요.</p>
            )}
        </>
    );
}
