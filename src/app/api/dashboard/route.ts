import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = session;

    // Aggregate facts
    const totalCount = await prisma.declaration.count({
      where: { companyId },
    });

    const valAggregation = await prisma.declaration.aggregate({
      where: { companyId },
      _sum: {
        totalAmount: true,
      },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyCount = await prisma.declaration.count({
      where: {
        companyId,
        date: {
          gte: startOfMonth,
        },
      },
    });

    // Recent items
    const recent = await prisma.declaration.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        date: true,
        preparedBy: true,
        totalAmount: true,
        _count: { select: { items: true } }
      }
    });

    // Mock chart data (we query group by month if using raw query, but to keep simple, we mock or fetch current year)
    // For production we'd do a raw sql group by. This is placeholder logic.
    const chartData = [
      { name: 'T1', total: 0 },
      { name: 'T2', total: 0 },
      { name: 'T3', total: 0 },
      { name: 'T4', total: 0 },
    ];
    // In actual code we would sum the amounts per month.

    return NextResponse.json({
      totalCount,
      totalValue: valAggregation._sum.totalAmount || 0,
      monthlyCount,
      recent,
      chartData,
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
