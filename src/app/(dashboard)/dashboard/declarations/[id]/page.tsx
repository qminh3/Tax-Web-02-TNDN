'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DeclarationTable, DeclarationItemProps, SellerRecord } from '@/components/DeclarationTable';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditDeclarationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [date, setDate] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [representative, setRepresentative] = useState('');
  const [items, setItems] = useState<DeclarationItemProps[]>([]);
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Sellers
    fetch('/api/sellers')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setSellers(data); })
      .catch(() => {});

    if (!id) return;
    fetch(`/api/declarations/${id}`)
      .then(res => res.json())
      .then(data => {
        setDate(data.date.split('T')[0]);
        setPreparedBy(data.preparedBy);
        setRepresentative(data.representative);
        setItems(data.items.map((i: any) => ({
          ...i,
          purchaseDate: i.purchaseDate.split('T')[0],
          quantity: Number(i.quantity) || 0,
          unitPrice: Number(i.unitPrice) || 0,
          totalPrice: Number(i.totalPrice) || 0
        })));
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const totalAmount = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    try {
      const res = await fetch(`/api/declarations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          preparedBy,
          representative,
          totalAmount,
          items: items.map(i => ({ ...i, quantity: Number(i.quantity) || 0, unitPrice: Number(i.unitPrice) || 0 }))
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Lỗi lưu bảng kê');
      }

      alert('Cập nhật thành công!');
      router.push('/dashboard/declarations');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="text-center p-8">Đang tải...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/declarations">
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-white border">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Cập nhật Bảng kê</h2>
        </div>
        <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          Lưu cập nhật
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-semibold text-lg mb-4 border-b pb-2">Thông tin chung</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Input label="Ngày lập" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            <Input label="Người lập biểu" value={preparedBy} onChange={e => setPreparedBy(e.target.value)} required />
            <Input label="Đại diện pháp luật" value={representative} onChange={e => setRepresentative(e.target.value)} required />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-2 pl-1">Chi tiết hàng hóa thu mua</h3>
        <DeclarationTable items={items} onChange={setItems} sellers={sellers} />
      </div>
    </form>
  );
}
