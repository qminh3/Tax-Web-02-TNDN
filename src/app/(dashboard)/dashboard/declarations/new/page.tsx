'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DeclarationTable, DeclarationItemProps, SellerRecord } from '@/components/DeclarationTable';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

function NewDeclarationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cloneId = searchParams.get('cloneId');
  const { user } = useAuth();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [preparedBy, setPreparedBy] = useState('');
  const [representative, setRepresentative] = useState('');
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  
  const [items, setItems] = useState<DeclarationItemProps[]>([
    { purchaseDate: new Date().toISOString().split('T')[0], sellerName: '', idNumber: '', address: '', productName: '', unit: '', quantity: '', unitPrice: '', totalPrice: 0, notes: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.fullName) {
      setPreparedBy(user.fullName);
    }
  }, [user]);

  // Load Sellers and optional Clone data
  useEffect(() => {
    async function loadData() {
      // 1. Fetch Sellers
      try {
        const res = await fetch('/api/sellers');
        if (res.ok) {
          const data = await res.json();
          setSellers(data);
        }
      } catch (err) {
        console.error('Failed to load sellers');
      }

      // 2. Fetch Clone Data
      if (cloneId) {
        try {
          const res = await fetch(`/api/declarations/${cloneId}`);
          if (res.ok) {
            const data = await res.json();
            const today = new Date().toISOString().split('T')[0];
            
            // Set cloned items but reset purchase date to today
            if (data.items && data.items.length > 0) {
              const clonedItems = data.items.map((item: any) => ({
                idNumber: item.idNumber,
                purchaseDate: today, // Reset to today
                sellerName: item.sellerName,
                address: item.address,
                productName: item.productName,
                unit: item.unit,
                quantity: Number(item.quantity) || 0,
                unitPrice: Number(item.unitPrice) || 0,
                totalPrice: Number(item.totalPrice) || 0,
                notes: item.notes || ''
              }));
              setItems(clonedItems);
            }
            if (data.representative) setRepresentative(data.representative);
          }
        } catch (err) {
          console.error('Failed to load clone data');
        }
      }
    }
    loadData();
  }, [cloneId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const totalAmount = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    try {
      const res = await fetch('/api/declarations', {
        method: 'POST',
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

      router.push('/dashboard/declarations');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/declarations">
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-white border">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Thêm Bảng kê mới {cloneId && '(Bản sao)'}</h2>
        </div>
        <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          Lưu Bảng kê
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

export default function NewDeclarationPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <NewDeclarationForm />
    </Suspense>
  );
}
