'use client';

import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-gray-50/40 px-4 lg:h-[60px] lg:px-6 justify-between">
      <div className="flex flex-1 items-center gap-4">
         <h1 className="font-semibold text-lg">Hệ thống quản lý bảng kê</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium leading-none mb-1">{user?.fullName}</p>
          <Badge variant={user?.role === 'ADMIN' ? 'success' : 'default'}>
            {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Kế toán'}
          </Badge>
        </div>
      </div>
    </header>
  );
}
