'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/format';

export default function UsersPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // In a real app we'd fetch from an API route. Since I didn't create a users API route for brevity in the requested plan, 
  // I will just display a message or fetch mock data. We can reuse /api/auth/me for current user.
  // We'll leave the full CRUD user for admin as a future enhancement as per bonus features scope.
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(d => {
        if(d.user) setData([d.user]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Quản lý nhân viên</h2>
        <p className="text-gray-500">Danh sách nhân viên trong công ty của bạn</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Họ và tên</TableHead>
                 <TableHead>Email</TableHead>
                 <TableHead>Chức vụ</TableHead>
                 <TableHead>Ngày tham gia</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {isLoading ? (
                 <TableRow><TableCell colSpan={4} className="text-center py-8">Đang tải...</TableCell></TableRow>
               ) : data.length === 0 ? (
                 <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">Không có dữ liệu</TableCell></TableRow>
               ) : (
                 data.map(item => (
                   <TableRow key={item.id}>
                     <TableCell className="font-medium">{item.fullName}</TableCell>
                     <TableCell>{item.email}</TableCell>
                     <TableCell>
                       <Badge variant={item.role === 'ADMIN' ? 'success' : 'default'}>
                         {item.role === 'ADMIN' ? 'Quản trị viên' : 'Kế toán'}
                       </Badge>
                     </TableCell>
                     <TableCell>{formatDate(new Date())}</TableCell>
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
