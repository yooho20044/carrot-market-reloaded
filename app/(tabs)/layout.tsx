import TabBar from "@/components/tab-bar"
import React from "react"

export default function TabLayout({children}:{
    children: React.ReactNode
}){
    return <div>
        {children}
        <TabBar />
    </div>
}