import {NextRequest, NextResponse} from "next/server";
import {PrismaClient} from "@/generated/prisma";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const { code } = await req.json();

    if (!code) {
        return NextResponse.json({ success: false, message: "缺少邀请码" }, { status: 400 });
    }

    const invite = await prisma.inviteCode.findUnique({
        where: { code: code.trim() },
    });

    if (!invite) {
        return NextResponse.json({ success: false, message: "邀请码不存在" }, { status: 404 });
    }

    if (invite.isUsed) {
        return NextResponse.json({ success: false, message: "邀请码已使用" }, { status: 403 });
    }

    // ✅ 可以在这里选择是否标记为已用：
    await prisma.inviteCode.update({
        where: { code },
        data: {
            isUsed: true,
            usedAt: new Date(),
        },
    });

    return NextResponse.json({ success: true });
}