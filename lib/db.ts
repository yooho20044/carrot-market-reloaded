import { PrismaClient } from "@prisma/client";

// 🔵 Prisma 인스턴스를 글로벌 객체에 저장 (중복 생성 방지)
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// ✅ Prisma 인스턴스를 생성하거나, 이미 존재하면 재사용
export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// ✅ `db`만 export (클라이언트에서 실행되지 않도록 보호)
export default db;

// ✅ 필요할 때만 `test()` 호출 가능
export async function test() {
    const token = await db.sMSToken.findUnique({
        where: { id: 1 },
        include: { user: true },
    });
    return token;
}