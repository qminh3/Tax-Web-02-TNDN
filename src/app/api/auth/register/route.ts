import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error?.issues?.[0]?.message || 'Lỗi dữ liệu' }, { status: 400 });
    }

    const { email, password, fullName, companyName, taxCode, companyAddress } = result.data;

    // Default basic check
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email đã được sử dụng' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Creates Company and User in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          taxCode,
          address: companyAddress,
        },
      });

      return await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          fullName,
          role: 'ADMIN', // First user is Admin of the company
          companyId: company.id,
        },
      });
    });

    const token = generateToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      message: 'Đăng ký thành công',
    }, { status: 201 });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
