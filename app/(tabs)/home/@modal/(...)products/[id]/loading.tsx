import CloseModal from "@/components/close-modal";
import { PhotoIcon } from "@heroicons/react/24/solid";

export default function Loading(){
    return(
        <div className="absolute w-full h-full z-50 flex justify-center items-center bg-black left-0 top-0 bg-opacity-60">
            <CloseModal />
            <div className="max-w-screen-sm flex justify-center w-full h-1/2">
                <div className="aspect-square bg-neutral-700 text-neutral-200 rounded-md flex justify-center items-center">
                    <PhotoIcon className="h-28" />
                </div>
            </div>
            <div className="flex flex-col gap-10">
                <div className="flex flex-row items-center gap-2">
                    <div className="size-14 rounded-full bg-neutral-700"/>
                    <div className="h-5 w-40 bg-neutral-700 rounded-md" />
                </div>
                <div className="flex flex-col gap-3">
                    <div className="h-5 w-20 bg-neutral-700 rounded-md" />
                    <div className="h-5 w-80 bg-neutral-700 rounded-md" />
                </div>
            </div>
        </div>
    )
}