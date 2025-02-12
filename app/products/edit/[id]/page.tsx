import { getProduct } from "@/app/products/edit/[id]/action";
import { notFound } from "next/navigation";
import EditProductPage from "./EditProductPage"; // 클라이언트 컴포넌트 가져오기
import getSession from "@/lib/session";

export default async function Page({ params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (isNaN(id)) return notFound();

    const product = await getProduct(id); // ✅ 서버에서 데이터 가져오기
    const session = await getSession();
    if(session.id !== product?.userId) return notFound();
    if (!product) return notFound();

    return <EditProductPage product={product} />; 
}