import Image from "next/image";
import { UserIcon } from "@heroicons/react/24/solid";
import { formatToTimeAgo } from "@/lib/utils";
import LogoutButton from "@/components/logout-button";
import { getUser } from "./action";
import Link from "next/link";



export default async function Profile(){
        const user = await getUser();   

    return (
    <div className="flex flex-col gap-5 p-4">
        <div className="flex flex-row gap-5">
            <div className="size-32 rounded-full overflow-hidden bg-neutral-700">
                {user.avatar !== null ?
                (<Image
                    width={28}
                    height={28}
                    className="size-32 rounded-full"
                    src={user.avatar}
                    alt={user.username}
                />) :
                (<UserIcon className="size-32"/>)}
            </div>
            <div className="flex flex-col justify-center gap-5">
                <div>
                    <span className="text-xl font-semibold">{user.username}</span>
                </div>
                <div>
                    <span>{user.email}</span>
                </div>
                <div>
                    <span>가입일 : {formatToTimeAgo(user.created_at.toString())}</span>
                </div>
            </div>
            <div className="flex ml-auto p-1">
                <LogoutButton />
            </div>
        </div>
        <div className="*:text-white *:cursor-pointer">
            <Link className="border-t-2 border-b-2 justify-center items-center flex h-20" href={`/profile/edit`}>
                <span>회원 정보 변경</span>
            </Link>
            <div className="border-t-2 border-b-2 justify-center items-center flex h-20">
                <span>내 상품 조회</span>
            </div>
        </div>
    </div>
)}