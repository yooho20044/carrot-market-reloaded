"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductType } from "./schema";
import { getUploadUrl, uploadProduct } from "./action";

export default function EditProductPage({ product }: any) {
    const [preview, setPreview] = useState(product?.photo ?? "");
    const [uploadUrl, setUploadUrl] = useState(product?.photo ?? "");
    const [file, setFile] = useState<File|null>(null)
    const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<ProductType>({
        resolver: zodResolver(productSchema),
        defaultValues: product,
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
    const onSubmit = handleSubmit(
        async (data:ProductType) => {
            //파일이 있으면 cloudflare에 저장
            //파일이 없다는건 기존에 저장된 사진이 있다는것
            if(file){
                const cloudflareForm = new FormData();
                cloudflareForm.append("file", file);
                const response = await fetch(uploadUrl, {
                    method:"POST",
                    body: cloudflareForm
                });
                if(response.status !== 200){
                    return;
                }
            }
            const productId = product.id;
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("price", data.price + "");
            formData.append("description", data.description);
            formData.append("photo", data.photo);
            formData.append("id", productId);
            const errors = await uploadProduct(formData);
            // if(errors){
            //     //setError("")
            // }    
        }
    );
    const onValid = async() => {
        await onSubmit()
    }
    return (<div>
        <form action={onValid} className="p-5 flex flex-col gap-5">
            <label htmlFor="photo"
                className="border-2 aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer bg-center bg-cover"
                style={{ backgroundImage: `url(${preview === product?.photo ? `${preview}/width=200` : preview})` }}>
                {preview === "" ? (
                    <>
                        <PhotoIcon className="w-20" />
                        <div className="text-neutral-400 text-sm">사진을 추가해주세요.</div>
                    </>
                ) : null}
            </label>
            <input onChange={onImageChange} type="file" id="photo" name="photo" className="hidden" />
            <Input required placeholder="제목" type="text" {...register("title")} />
            <Input {...register("price")} required placeholder="가격" type="number" />
            <Input {...register("description")} required placeholder="자세한 설명" type="text"  />
            <Button text="수정완료" />
        </form>
        </div>
    );
}
