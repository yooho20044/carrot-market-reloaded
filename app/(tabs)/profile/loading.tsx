export default function Loading(){
    return(
    <div className="p-5 animate-pulse flex flex-col gap-5">
        <div className="flex flex-row gap-5">
            <div className="size-32 rounded-full bg-neutral-700"/>
            <div className="flex flex-col justify-center gap-5">
                <div className="bg-neutral-700 h-5 w-20"/>
                <div className="bg-neutral-700 h-5 w-40"/>
                <div className="bg-neutral-700 h-5 w-40"/>
            </div>
        </div>
    </div>
    )
}