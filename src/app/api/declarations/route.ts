import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/api-helpers';
import { declarationSchema } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let itemsFilter = {};
    if (search) {
      itemsFilter = {
        items: {
          some: {
            OR: [
              { sellerName: { contains: search, mode: 'insensitive' } },
              { productName: { contains: search, mode: 'insensitive' } },
            ]
          }
        }
      };
    }

    const declarations = await prisma.declaration.findMany({
      where: {
        companyId: session.companyId,
        ...itemsFilter
      },
      orderBy: { date: 'desc' },
      include: {
        _count: {
          select: { items: true }
        }
      }
    });

    return NextResponse.json(declarations);
  } catch (error) {
    console.error('List errors:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const result = declarationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error?.issues?.[0]?.message || 'Lỗi dữ liệu' }, { status: 400 });
    }

    const { date, preparedBy, representative, totalAmount, items } = result.data;

    const declaration = await prisma.declaration.create({
      data: {
        companyId: session.companyId,
        createdById: session.userId,
        date: new Date(date),
        preparedBy,
        representative,
        totalAmount,
        items: {
          create: items.map(item => ({
            purchaseDate: new Date(item.purchaseDate),
            sellerName: item.sellerName,
            idNumber: item.idNumber,
            address: item.address,
            phone: item.phone,
            productName: item.productName,
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            notes: item.notes,
          }))
        }
      }
    });

    return NextResponse.json(declaration, { status: 201 });
  } catch (error) {
    console.error('Create error:', error);
    return NextResponse.json({ error: 'Lỗi khi tạo' }, { status: 500 });
  }
}
