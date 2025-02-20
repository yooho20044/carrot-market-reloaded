"use client"


import Button from "@/components/button";
import Input from "@/components/input";
import { getUploadUrl, getUser, editUser } from "./action";
import { useEffect, useRef, useState } from "react";
import { UserIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileType } from "./schema";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

// ✅ User 타입 정의
interface User {
    username: string;
    email: string | null;
    password: string | null;
    id: number;
    phone: string | null;
    github_id: string | null;
    avatar: string | null;
    created_at: Date;
    updated_at: Date;
}


export default function EditProfile(){
    const avatarUrlRef = useRef<string | null>(null);
    const [userAvatar, setUserAvatar] = useState<string | null>("");
    const [user, setUser] = useState<User | null>(null);
    const [file, setFile] = useState<File|null>(null)
    const [preview, setPreview] = useState("");
    const [uploadUrl, setUploadUrl] = useState("");
    const {register, handleSubmit, setValue, reset, formState: {errors}} = useForm<ProfileType>({
            resolver:zodResolver(profileSchema),
        });
    
    const router = useRouter();
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
            const avatarUrl = `https://imagedelivery.net/ei8ubQSruTv8AmnS3d2tXQ/${id}/avatar`;
            avatarUrlRef.current = avatarUrl;
            setUploadUrl(uploadURL);
            setValue("avatar", avatarUrl)
            setUserAvatar(avatarUrl);
            console.log("Computed avatarURL:", avatarUrl);
        }
    };

    useEffect(() => {
        async function fetchUser() {
            try {
                const userData = await getUser();
                setUser(userData);
                setUserAvatar(userData.avatar);
                if (userData) {
                    // 폼 필드의 값을 업데이트
                    reset({
                        username: userData.username,
                        phone: userData.phone ? userData.phone : null,
                        avatar: userData.avatar || null, // 없으면 null로 설정
                    });
                    if (userData.avatar) {
                        setPreview(userData.avatar);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        }
        fetchUser();
    }, [reset]);

    useEffect(() => {
        register("avatar");
      }, [register]);
    
    const onSubmit = handleSubmit(
        async (data: ProfileType) => {
          // 파일이 있을 때만 업로드 처리
        if (file) {
            try{
                const cloudflareForm = new FormData();
                cloudflareForm.append("file", file);
                const response = await fetch(uploadUrl, {
                    method: "POST",
                    body: cloudflareForm,
                });
                if (response.status !== 200) {
                  // 업로드 실패 시 처리
                return;
                }
            }catch(error){
                console.error("Failed to upload image:", error);
            }
            
            // onImageChange에서 이미 setValue("avatar", ...)를 통해 avatar URL이 설정되어 있다고 가정
          }else{
            setValue("avatar", null);
          }
          // 파일이 없더라도 기존의 avatar 값(혹은 빈 값)을 이용하여 폼 데이터 생성
          const formData = new FormData();
          formData.append("username", data.username);
          formData.append("phone", data.phone + "" || "");
          if (avatarUrlRef.current !== null) {
            formData.append("avatar", avatarUrlRef.current);
         }else if(data.avatar){
            formData.append("avatar", data.avatar);
         }
        const result = await editUser(formData);
        if(result && 'success' in result && result.success){
            setFile(null);
            router.push("/profile");
            router.refresh();
        }
        },
        (errors) => {
          console.log("Validation errors:", errors);
        }
      );

    return(
        <div>
            <div className="flex flex-col gap-10 py-8 px-6">
                <div className="flex flex-col gap-2 *:font-medium items-center">
                    <h1 className="text-2xl">회원 정보 변경</h1>
                </div>
                <form onSubmit={onSubmit} className="flex flex-col gap-3">
                    <label
                        htmlFor="avatar"
                        className="mx-auto relative flex justify-center items-center w-36 h-36 rounded-full bg-neutral-500 overflow-hidden"
                    >
                        {preview && (
                            <div 
                                className="absolute inset-0 w-full h-full"
                                style={{ 
                                    backgroundImage: `url(${preview})`, 
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat"
                                }}
                            />
                        )}

                        {!preview && (
                            <UserIcon 
                                className="absolute bg-neutral-500 text-white"
                                style={{
                                    width: "50%",
                                    height: "50%",
                                    left: "50%",
                                    top: "50%",
                                    transform: "translate(-50%, -50%)"
                                }}
                            />
                        )}
                    </label>
                    <input onChange={onImageChange} type="file" id="avatar" name="avatar" className="hidden"/>
                    <span>{user?.email}</span>
                    <Input  {...register("username")} type="text" placeholder="Username" defaultValue={user?.username} required minLength={3} maxLength={10}/>
                    <Input  {...register("phone")} type="text" placeholder="Phone Number" defaultValue={user?.phone!} required minLength={8} maxLength={11}/>
                    <Button text="Edit account"/>
                    {/* <button className="" type="submit">Edit account</button> */}
                </form>
            </div>
        </div>
    )
}