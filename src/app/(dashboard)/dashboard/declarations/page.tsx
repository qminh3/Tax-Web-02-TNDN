'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Edit, Plus, Search, Trash2, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/lib/format';

export default function DeclarationsPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchList = (query = '') => {
    setIsLoading(true);
    fetch(`/api/declarations${query ? `?search=${query}` : ''}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchList(search);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bảng kê này?')) return;
    try {
      const res = await fetch(`/api/declarations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchList(search);
      } else {
        alert('Có lỗi khi xóa');
      }
    } catch (err) {
      alert('Có lỗi khi xóa');
    }
  };

  const handleExport = async (id: string) => {
    window.location.href = `/api/declarations/${id}/export`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Danh sách Bảng kê 02/TNDN</h2>
          <p className="text-gray-500">Quản lý và xuất Excel các bảng kê đã lập</p>
        </div>
        <Link href="/dashboard/declarations/new">
          <Button variant="solid" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Bảng kê mới
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="py-4">
          <form onSubmit={handleSearch} className="flex max-w-sm gap-2">
             <Input 
               placeholder="Tìm theo người bán, hàng hóa..." 
               value={search}
               onChange={e => setSearch(e.target.value)}
             />
             <Button type="submit" variant="outline"><Search className="h-4 w-4" /></Button>
          </form>
        </CardHeader>
        <CardContent>
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Ngày lập</TableHead>
                 <TableHead>Người lập / Đại diện</TableHead>
                 <TableHead>Số mặt hàng</TableHead>
                 <TableHead className="text-right">Tổng thanh toán</TableHead>
                 <TableHead className="text-right">Thao tác</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {isLoading ? (
                 <TableRow><TableCell colSpan={5} className="text-center py-8">Đang tải...</TableCell></TableRow>
               ) : data.length === 0 ? (
                 <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Không có dữ liệu</TableCell></TableRow>
               ) : (
                 data.map(item => (
                   <TableRow key={item.id}>
                     <TableCell>{formatDate(item.date)}</TableCell>
                     <TableCell>
                       <p className="font-medium">{item.preparedBy}</p>
                       <p className="text-xs text-gray-500">{item.representative}</p>
                     </TableCell>
                     <TableCell>{item._count.items}</TableCell>
                     <TableCell className="text-right font-medium text-green-700">{formatCurrency(item.totalAmount)}</TableCell>
                     <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                         <Button variant="outline" size="sm" onClick={() => handleExport(item.id)} title="Xuất Excel">
                           <Download className="h-4 w-4" />
                         </Button>
                         <Link href={`/dashboard/declarations/new?cloneId=${item.id}`}>
                           <Button variant="outline" size="sm" title="Nhân bản (Clone)">
                             <Copy className="h-4 w-4" />
                           </Button>
                         </Link>
                         <Link href={`/dashboard/declarations/${item.id}`}>
                           <Button variant="outline" size="sm" title="Sửa">
                             <Edit className="h-4 w-4" />
                           </Button>
                         </Link>
                         <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)} title="Xóa">
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 ))
               )}
             </TableBody>
           </Table>
        </CardContent>
      </Card>
    </div>
  );
}
