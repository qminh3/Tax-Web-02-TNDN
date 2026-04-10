'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    taxCode: '',
    companyAddress: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      login(data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-0 my-8">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">Đăng ký công ty</CardTitle>
        <p className="text-sm text-gray-500 mt-2">Đăng ký tài khoản Admin và tạo công ty mới</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">{error}</div>}
          
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-1">1. Thông tin công ty</h3>
            <Input label="Tên công ty" name="companyName" value={formData.companyName} onChange={handleChange} required />
            <Input label="Mã số thuế" name="taxCode" value={formData.taxCode} onChange={handleChange} required />
            <Input label="Địa chỉ" name="companyAddress" value={formData.companyAddress} onChange={handleChange} required />
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="font-semibold text-gray-900 border-b pb-1">2. Thông tin Quản trị viên</h3>
            <Input label="Họ và tên" name="fullName" value={formData.fullName} onChange={handleChange} required />
            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <Input label="Mật khẩu" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Ít nhất 6 ký tự" required />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" isLoading={isLoading}>Đăng ký ngay</Button>
          </div>
          
          <div className="text-center text-sm pt-2">
            <span className="text-gray-500">Đã có tài khoản? </span>
            <Link href="/login" className="text-green-600 hover:underline font-medium">Đăng nhập</Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
