import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/api-helpers';
import { declarationSchema } from '@/lib/validations';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    
    const declaration = await prisma.declaration.findUnique({
      where: { id, companyId: session.companyId },
      include: {
        items: true,
      }
    });

    if (!declaration) {
      return NextResponse.json({ error: 'Bảng kê không tồn tại' }, { status: 404 });
    }

    return NextResponse.json(declaration);
  } catch (error) {
    console.error('Get declaration error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const result = declarationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error?.issues?.[0]?.message || 'Lỗi dữ liệu' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.declaration.findUnique({
      where: { id, companyId: session.companyId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Bảng kê không tồn tại' }, { status: 404 });
    }

    const { date, preparedBy, representative, totalAmount, items } = result.data;

    // We do a transaction: delete old items, create new. This is simpler than matching IDs.
    const declaration = await prisma.$transaction(async (tx) => {
      await tx.declarationItem.deleteMany({
        where: { declarationId: id }
      });

      return await tx.declaration.update({
        where: { id },
        data: {
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
        },
        include: { items: true }
      });
    });

    return NextResponse.json(declaration);
  } catch (error) {
    console.error('Update declaration error:', error);
    return NextResponse.json({ error: 'Lỗi khi cập nhật' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    
    await prisma.declaration.delete({
      where: { id, companyId: session.companyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete declaration error:', error);
    return NextResponse.json({ error: 'Lỗi khi xóa' }, { status: 500 });
  }
}
