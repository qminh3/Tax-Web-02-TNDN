'use client';

import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

export interface DeclarationItemProps {
  id?: string;
  idNumber: string;
  purchaseDate: string;
  sellerName: string;
  address: string;
  productName: string;
  unit: string;
  quantity: number | '';
  unitPrice: number | '';
  totalPrice: number;
  notes: string;
}

export interface SellerRecord {
  sellerName: string;
  idNumber: string;
  address: string;
  productName: string;
  unit: string;
  unitPrice: number;
}

interface SpreadsheetProps {
  items: DeclarationItemProps[];
  onChange: (items: DeclarationItemProps[]) => void;
  sellers?: SellerRecord[];
}

export function DeclarationTable({ items, onChange, sellers = [] }: SpreadsheetProps) {
  
  const handleItemChange = (index: number, field: keyof DeclarationItemProps, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    // Auto-fill logic from Sellers list
    if (field === 'sellerName' && sellers.length > 0) {
      const match = sellers.find(s => s.sellerName === value);
      if (match) {
        item.idNumber = match.idNumber || '';
        item.address = match.address || '';
        item.productName = match.productName || '';
        item.unit = match.unit || '';
        item.unitPrice = match.unitPrice ? Number(match.unitPrice) : '';
      }
    }

    // Auto calculate
    if (field === 'quantity' || field === 'unitPrice' || field === 'sellerName') {
      const q = field === 'quantity' ? value : item.quantity;
      const p = field === 'unitPrice' ? value : item.unitPrice;
      const numQ = Number(q) || 0;
      const numP = Number(p) || 0;
      item.totalPrice = numQ * numP;
    }

    newItems[index] = item as DeclarationItemProps;
    onChange(newItems);
  };

  const addRow = () => {
    const today = new Date().toISOString().split('T')[0];
    onChange([...items, { purchaseDate: today, sellerName: '', idNumber: '', address: '', productName: '', unit: '', quantity: '', unitPrice: '', totalPrice: 0, notes: '' }]);
  };

  const removeRow = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const inputClass = "w-full border-0 focus:ring-1 focus:ring-green-500 rounded p-1 text-sm bg-transparent hover:bg-gray-50 focus:bg-white transition-colors h-8";

  // Get unique seller names for datalist to avoid duplicates
  const uniqueSellers = Array.from(new Set(sellers.map(s => s.sellerName)))
    .map(name => sellers.find(s => s.sellerName === name))
    .filter(Boolean);

  return (
    <div className="border rounded-md overflow-hidden bg-white shadow-sm">
      <datalist id="seller-suggestions">
        {uniqueSellers.map((s, idx) => (
          <option key={idx} value={s?.sellerName}>{s?.productName} - {s?.address}</option>
        ))}
      </datalist>

      <div className="overflow-x-auto max-h-[600px] relative">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
            <tr>
              <th className="p-2 border-b w-10 text-center">STT</th>
              <th className="p-2 border-b text-left">Ngày mua</th>
              <th className="p-2 border-b w-48 text-left min-w-[150px]">Người bán</th>
              <th className="p-2 border-b w-32 text-left">CMND/CCCD</th>
              <th className="p-2 border-b w-48 text-left min-w-[200px]">Địa chỉ</th>
              <th className="p-2 border-b w-48 text-left min-w-[150px]">Tên hàng hóa</th>
              <th className="p-2 border-b w-20 text-center min-w-[80px]">ĐVT</th>
              <th className="p-2 border-b w-24 text-right min-w-[100px]">Số lượng</th>
              <th className="p-2 border-b w-32 text-right min-w-[120px]">Đơn giá</th>
              <th className="p-2 border-b w-32 text-right min-w-[120px]">Thành tiền</th>
              <th className="p-2 border-b w-32 text-left min-w-[150px]">Ghi chú</th>
              <th className="p-2 border-b w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-green-50/30 transition-colors group">
                <td className="p-1 border-r text-center text-gray-500 font-medium bg-gray-50">{idx + 1}</td>
                <td className="p-1 border-r">
                   <input type="date" value={item.purchaseDate} onChange={e => handleItemChange(idx, 'purchaseDate', e.target.value)} className={inputClass} />
                </td>
                <td className="p-1 border-r">
                   <input type="text" list="seller-suggestions" value={item.sellerName} onChange={e => handleItemChange(idx, 'sellerName', e.target.value)} className={inputClass} placeholder="Bà Nguyễn Thị A..." />
                </td>
                <td className="p-1 border-r">
                   <input type="text" value={item.idNumber} onChange={e => handleItemChange(idx, 'idNumber', e.target.value)} className={inputClass} />
                </td>
                <td className="p-1 border-r">
                   <input type="text" value={item.address} onChange={e => handleItemChange(idx, 'address', e.target.value)} className={inputClass} />
                </td>
                <td className="p-1 border-r">
                   <input type="text" value={item.productName} onChange={e => handleItemChange(idx, 'productName', e.target.value)} className={inputClass} />
                </td>
                <td className="p-1 border-r">
                   <input type="text" value={item.unit} onChange={e => handleItemChange(idx, 'unit', e.target.value)} className={`${inputClass} text-center`} />
                </td>
                <td className="p-1 border-r">
                   <input type="number" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value === '' ? '' : Number(e.target.value))} className={`${inputClass} text-right`} />
                </td>
                <td className="p-1 border-r">
                   <input type="number" value={item.unitPrice} onChange={e => handleItemChange(idx, 'unitPrice', e.target.value === '' ? '' : Number(e.target.value))} className={`${inputClass} text-right`} />
                </td>
                <td className="p-1 border-r bg-gray-50/50">
                   <input type="text" readOnly value={new Intl.NumberFormat('vi-VN').format(item.totalPrice)} className={`${inputClass} text-right font-semibold text-green-700 bg-transparent`} />
                </td>
                <td className="p-1 border-r">
                   <input type="text" value={item.notes || ''} onChange={e => handleItemChange(idx, 'notes', e.target.value)} className={inputClass} />
                </td>
                <td className="p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => removeRow(idx)} disabled={items.length <= 1} className="p-1 text-red-500 hover:bg-red-100 rounded disabled:opacity-30 mx-auto">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 border-t bg-gray-50 flex border-b">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="mr-1 w-4 h-4" /> Thêm dòng
        </Button>
      </div>
      <div className="p-4 bg-white flex justify-end items-center gap-4 border-t-2 border-gray-100">
        <span className="font-medium text-gray-500">Tổng cộng thanh toán:</span>
        <span className="text-xl font-bold text-green-600">{new Intl.NumberFormat('vi-VN').format(items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0))} VNĐ</span>
      </div>
    </div>
  );
}
