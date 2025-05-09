import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query', 'error', 'warn'], // 开发阶段可以开日志，生产可以关
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { code } = body;

    if (!code) {
        return NextResponse.json({ success: false, message: '邀请码不能为空' }, { status: 400 });
    }

    // 示例逻辑：插入或验证邀请码
    const existing = await prisma.inviteCode.findUnique({ where: { code } });

    if (existing) {
        return NextResponse.json({ success: false, message: '邀请码已存在' }, { status: 409 });
    }

    const created = await prisma.inviteCode.create({ data: { code } });

    return NextResponse.json({ success: true, data: created });
}