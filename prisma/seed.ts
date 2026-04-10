import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const passwordHash = await bcrypt.hash('password123', 10);

  // Clean db
  await prisma.declarationItem.deleteMany();
  await prisma.declaration.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // Create Company
  const company = await prisma.company.create({
    data: {
      name: 'Công ty Cổ phần Nông sản Việt',
      taxCode: '0101234567',
      address: '123 Đường Láng, Đống Đa, Hà Nội',
      phone: '02431234567',
    },
  });

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@nongsan.vn',
      passwordHash,
      fullName: 'Quản trị viên',
      role: 'ADMIN',
      companyId: company.id,
    },
  });

  // Create Accountant
  const accountant = await prisma.user.create({
    data: {
      email: 'ketoan@nongsan.vn',
      passwordHash,
      fullName: 'Nhân viên Kế toán',
      role: 'ACCOUNTANT',
      companyId: company.id,
    },
  });

  // Create a Sample Declaration
  const declaration = await prisma.declaration.create({
    data: {
      companyId: company.id,
      date: new Date(),
      preparedBy: accountant.fullName,
      representative: 'Nguyễn Văn Giám Đốc',
      totalAmount: 15500000,
      createdById: accountant.id,
      items: {
        create: [
          {
            purchaseDate: new Date(),
            sellerName: 'Trần Thị Nông',
            idNumber: '030190123456',
            address: 'Xã Đoài, Huyện X, Tỉnh Nghệ An',
            productName: 'Cam Vinh',
            unit: 'kg',
            quantity: 500,
            unitPrice: 25000,
            totalPrice: 12500000,
          },
          {
            purchaseDate: new Date(),
            sellerName: 'Lê Văn Trồng',
            idNumber: '012345678912',
            address: 'Huyện Mộc Châu, Sơn La',
            productName: 'Mận Mộc Châu',
            unit: 'kg',
            quantity: 100,
            unitPrice: 30000,
            totalPrice: 3000000,
          },
        ],
      },
    },
  });

  console.log('Seed completed successfully!');
  console.log('Login credentials:');
  console.log('Admin: admin@nongsan.vn / password123');
  console.log('Accountant: ketoan@nongsan.vn / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
