"use client"

import Button from "@/components/button";
import Input from "@/components/input";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { getUploadUrl, uploadProduct } from "./action";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductType } from "./schema";
import { useForm } from "react-hook-form";

export default function AddProduct(){
    const [preview, setPreview] = useState("");
    const [uploadUrl, setUploadUrl] = useState("");
    const [file, setFile] = useState<File|null>(null)
    const {register, handleSubmit, setValue, setError, formState: {errors}} = useForm<ProductType>({
        resolver:zodResolver(productSchema),
    });
    const onImageChange = async (event:React.ChangeEvent<HTMLInputElement>) => {
        const {target: {files},} = event;
        if(!files){
            return;
        }
        const file = files[0];
        if(file.size > 2097152){
            alert("2MB 이하의 사진만 업로드 가능합니다.");
            return;
        }
        if(!file.type.includes('image')){
            alert("이미지만 업로드 가능합니다.");
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        setFile(file);
        const {success, result} = await getUploadUrl();
        if(success){
            const {id, uploadURL} = result;
            setUploadUrl(uploadURL);
            setValue("photo", `https://imagedelivery.net/ei8ubQSruTv8AmnS3d2tXQ/${id}`)
        }
    };
    const onSubmit = 
        async (data:ProductType) => {
            if(!file){
                return;
            }
            const cloudflareForm = new FormData();
            cloudflareForm.append("file", file);
            const response = await fetch(uploadUrl, {
                method:"POST",
                body: cloudflareForm
            });
            if(response.status !== 200){
                return;
            }
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("price", data.price + "");
            formData.append("description", data.description);
            formData.append("photo", data.photo);
            const errors = await uploadProduct(formData);
            if(errors){
                //setError("")
            }
    
        };

        return <div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 flex flex-col gap-5">
            <label htmlFor="photo" className="border-2 aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer bg-center bg-cover"
            style={{backgroundImage:`url(${preview})`}}>
                {preview === "" ? 
                <>
                    <PhotoIcon className="w-20" />
                    <div className="text-neural-400 text-sm">사진을 추가해주세요.{errors.photo?.message}</div>
                </> : null}
            </label>
            <input onChange={onImageChange} type="file" id="photo" name="photo" className="hidden"/>
            <Input required placeholder="제목" type="text" {...register("title")} errors={[errors.title?.message ?? ""]}/>
            <Input {...register("price")} required placeholder="가격" type="number" errors={[errors.price?.message ?? ""]}/>
            <Input
                {...register("description")}
                required
                placeholder="자세한 설명"
                type="text"
                errors={[errors.description?.message ?? ""]}
            />
            <Button text="작성완료" />
        </form>
    </div>
}