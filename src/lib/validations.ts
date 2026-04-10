import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
});

export const registerSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
  fullName: z.string().min(2, { message: 'Tên quá ngắn' }),
  companyName: z.string().min(2, { message: 'Tên công ty quá ngắn' }),
  taxCode: z.string().min(10, { message: 'Mã số thuế không hợp lệ' }),
  companyAddress: z.string().min(5, { message: 'Địa chỉ công ty quá ngắn' }),
});

export const declarationItemSchema = z.object({
  id: z.string().optional(),
  purchaseDate: z.string().or(z.date()),
  sellerName: z.string().min(1, { message: 'Tên người bán là bắt buộc' }),
  idNumber: z.string().min(9, { message: 'CMND/CCCD không hợp lệ' }),
  phone: z.string().optional().nullable(),
  address: z.string().min(1, { message: 'Địa chỉ là bắt buộc' }),
  productName: z.string().min(1, { message: 'Tên hàng hóa là bắt buộc' }),
  unit: z.string().min(1, { message: 'ĐVT là bắt buộc' }),
  quantity: z.number().positive({ message: 'Số lượng phải lớn hơn 0' }),
  unitPrice: z.number().positive({ message: 'Đơn giá phải lớn hơn 0' }),
  totalPrice: z.number(),
  notes: z.string().optional().nullable(),
});

export const declarationSchema = z.object({
  date: z.string().or(z.date()),
  preparedBy: z.string().min(1, { message: 'Người lập là bắt buộc' }),
  representative: z.string().min(1, { message: 'Đại diện là bắt buộc' }),
  totalAmount: z.number().nonnegative(),
  items: z.array(declarationItemSchema).min(1, { message: 'Cần ít nhất 1 dòng dữ liệu' }),
});
