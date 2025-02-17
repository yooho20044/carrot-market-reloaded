"use client"

import Button from "@/components/button";
import Input from "@/components/input";
import { uploadPost } from "./action";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema, PostType } from "./schema";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export default function AddPost(){
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: {errors}} = useForm<PostType>({
        resolver: zodResolver(postSchema),
      });
        // 폼 제출 핸들러
    const onSubmit = async (data:PostType) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        const errors = await uploadPost(formData);
        if(errors){
        }
    };

    const onCloseClick= () => {
        router.push("/life");
    }

    return(
        <div>
            <button onClick={onCloseClick} className="absolute right-20 top-2 text-neutral-200">
                <XMarkIcon className="size-10" />
            </button>
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 flex flex-col gap-5">
                <Input required placeholder="제목을 적어주세요." type="text" {...register("title")} errors={[errors.title?.message ?? ""]}/>
                <textarea
                        required
                        className="bg-transparent rounded-md w-full h-96 focus:outline-none ring-1 focus:ring-4 transition ring-neutral-200 focus:ring-orange-500 border-none placeholder:text-neutral-400"
                        placeholder="동네생활에 대한 자세한 내용을 적어주세요."
                        {...register("description")} 
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                <Button text="작성완료" />
            </form>
        </div>
    )
}