'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { MonthlyChart } from '@/components/MonthlyChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/lib/format';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tổng quan</h2>
        <p className="text-gray-500">Chào mừng trở lại, đây là thống kê hoạt động của bạn.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Tổng số Bảng kê" value={data?.totalCount || 0} icon={FileText} colorClass="text-blue-600" />
        <StatsCard title="Tổng giá trị giao dịch" value={`${formatCurrency(data?.totalValue || 0)} đ`} icon={DollarSign} colorClass="text-green-600" />
        <StatsCard title="Bảng kê tháng này" value={data?.monthlyCount || 0} icon={Calendar} colorClass="text-orange-600" />
        <StatsCard title="Tăng trưởng" value="+12%" icon={TrendingUp} colorClass="text-purple-600" description="So với cùng kỳ" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Biểu đồ giá trị giao dịch (Thay thế logic)</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={data?.chartData || []} />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bảng kê gần đây</CardTitle>
            <Link href="/dashboard/declarations" className="text-sm text-green-600 hover:underline">Xem tất cả</Link>
          </CardHeader>
          <CardContent>
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Ngày lập</TableHead>
                   <TableHead>Người lập</TableHead>
                   <TableHead className="text-right">Giá trị</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {data?.recent?.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={3} className="text-center text-gray-500">Chưa có bảng kê nào</TableCell>
                   </TableRow>
                 ) : (
                   data?.recent?.map((item: any) => (
                     <TableRow key={item.id}>
                       <TableCell>{formatDate(item.date)}</TableCell>
                       <TableCell>{item.preparedBy}</TableCell>
                       <TableCell className="text-right font-medium">{formatCurrency(item.totalAmount)}</TableCell>
                     </TableRow>
                   ))
                 )}
               </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
