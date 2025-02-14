export default function Loading(){
    return (
        <div className="p-5 animate-pulse flex flex-col gap-5">
            {[...Array(10)].map((_,index) => (
                <div key={index} className="*:rounded-md pb-3 flex gap-5 w-full">
                    <div className="flex flex-row gap-3">
                        <div className="size-14 rounded-full bg-neutral-700"/>
                        <div className="flex flex-col gap-2 *:rounded-md">
                            <div className="bg-neutral-700 h-5 w-40"/>
                            <div className="bg-neutral-700 h-5 w-80"/>
                        </div>
                        <div className="flex *:rounded-md right-0">
                            <div className="bg-neutral-700 h-5 w-10"/>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}