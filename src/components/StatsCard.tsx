import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  colorClass?: string;
}

export function StatsCard({ title, value, icon: Icon, description, colorClass = "text-green-600" }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-full bg-gray-100 ${colorClass} bg-opacity-20`}>
          <Icon className={`h-6 w-6 ${colorClass}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h4 className="text-2xl font-bold">{value}</h4>
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
