import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/api-helpers';
import { generateExcel } from '@/lib/excel-export';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    
    const declaration = await prisma.declaration.findUnique({
      where: { id, companyId: session.companyId },
      include: {
        items: true,
        company: true
      }
    });

    if (!declaration) {
      return NextResponse.json({ error: 'Bảng kê không tồn tại' }, { status: 404 });
    }

    const data = {
      company: {
        name: declaration.company.name,
        taxCode: declaration.company.taxCode,
        address: declaration.company.address,
      },
      declaration: {
        date: declaration.date,
        preparedBy: declaration.preparedBy,
        representative: declaration.representative,
        totalAmount: Number(declaration.totalAmount),
        items: declaration.items.map(i => ({
          ...i,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          totalPrice: Number(i.totalPrice),
        })),
      }
    };

    const buffer = await generateExcel(data);

    // Create response with file
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="Bang_ke_02_TNDN_${id}.xlsx"`);

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Lỗi xuất file Excel' }, { status: 500 });
  }
}
