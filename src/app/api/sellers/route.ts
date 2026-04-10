import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch unique sellers inside the company
    const sellersRaw = await prisma.declarationItem.findMany({
      where: {
        declaration: { companyId: session.companyId }
      },
      distinct: ['sellerName', 'idNumber'],
      orderBy: { purchaseDate: 'desc' },
      select: {
        sellerName: true,
        idNumber: true,
        address: true,
        productName: true,
        unit: true,
        unitPrice: true,
      }
    });

    return NextResponse.json(sellersRaw);
  } catch (error) {
    console.error('List sellers error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
