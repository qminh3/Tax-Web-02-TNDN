import ExcelJS from 'exceljs';
import { formatDate, numberToVietnameseWords } from './format';

interface ExportData {
  company: {
    name: string;
    taxCode: string;
    address: string;
  };
  declaration: {
    date: Date;
    preparedBy: string;
    representative: string;
    totalAmount: number;
    items: Array<{
      purchaseDate: Date;
      sellerName: string;
      idNumber: string;
      address: string;
      productName: string;
      unit: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      notes: string | null;
    }>;
  };
}

export async function generateExcel(data: ExportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Bảng kê 02-TNDN', {
    pageSetup: { paperSize: 9, orientation: 'landscape', margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5 } }
  });

  // Fonts
  const boldFont = { name: 'Times New Roman', size: 12, bold: true };
  const normalFont = { name: 'Times New Roman', size: 12 };


  // 1. Company Info (Top Left)
  sheet.mergeCells('A1:E1');
  const compName = sheet.getCell('A1');
  compName.value = `Đơn vị: ${data.company.name}`;
  compName.font = boldFont;

  sheet.mergeCells('A2:E2');
  const compTax = sheet.getCell('A2');
  compTax.value = `Mã số thuế: ${data.company.taxCode}`;
  compTax.font = boldFont;
  
  sheet.mergeCells('A3:E3');
  sheet.getCell('A3').value = `Địa chỉ: ${data.company.address}`;

  // Form type
  sheet.mergeCells('J1:K1');
  const formName = sheet.getCell('J1');
  formName.value = 'Mẫu số: 02/TNDN';
  formName.font = boldFont;
  formName.alignment = { horizontal: 'right' };

  // 2. Title
  sheet.mergeCells('A5:K5');
  const title = sheet.getCell('A5');
  title.value = 'BẢNG KÊ THU MUA HÀNG HÓA, DỊCH VỤ MUA VÀO KHÔNG CÓ HÓA ĐƠN';
  title.font = { name: 'Times New Roman', size: 14, bold: true };
  title.alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('A6:K6');
  const dateStr = sheet.getCell('A6');
  const d = new Date(data.declaration.date);
  dateStr.value = `Ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
  dateStr.font = { name: 'Times New Roman', size: 11, italic: true };
  dateStr.alignment = { horizontal: 'center', vertical: 'middle' };

  // 3. Table Header
  const headerRow = sheet.getRow(8);
  const headers = ['STT', 'Ngày mua', 'Người bán', 'CMND/CCCD', 'Địa chỉ', 'Tên hàng hóa', 'ĐVT', 'Số lượng', 'Đơn giá', 'Thành tiền', 'Ghi chú'];
  
  headers.forEach((headerText, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = headerText;
    cell.font = boldFont;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  headerRow.height = 30;

  // Set column widths
  sheet.columns = [
    { width: 5 },   // STT
    { width: 12 },  // Ngay mua
    { width: 20 },  // Nguoi ban
    { width: 15 },  // CCCD
    { width: 25 },  // Dia chi
    { width: 20 },  // Ten hang
    { width: 8 },   // DVT
    { width: 10 },  // So luong
    { width: 15 },  // Don gia
    { width: 18 },  // Thanh tien
    { width: 15 }   // Ghi chu
  ];

  // 4. Data Rows
  let currentRow = 9;
  data.declaration.items.forEach((item, index) => {
    const row = sheet.getRow(currentRow);
    row.getCell(1).value = index + 1;
    row.getCell(2).value = formatDate(item.purchaseDate);
    row.getCell(3).value = item.sellerName;
    row.getCell(4).value = item.idNumber;
    row.getCell(5).value = item.address;
    row.getCell(6).value = item.productName;
    row.getCell(7).value = item.unit;
    row.getCell(8).value = item.quantity;
    row.getCell(9).value = Number(item.unitPrice);
    row.getCell(10).value = Number(item.totalPrice);
    row.getCell(11).value = item.notes || '';

    // Formatting numbers
    row.getCell(8).numFmt = '#,##0.###';
    row.getCell(9).numFmt = '#,##0';
    row.getCell(10).numFmt = '#,##0';

    // Borders and alignment
    for (let i = 1; i <= 11; i++) {
      const cell = row.getCell(i);
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      cell.font = normalFont;
      if (i === 1 || i === 2 || i === 7) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else {
        cell.alignment = { vertical: 'middle' };
      }
    }
    currentRow++;
  });

  // 5. Total Row
  const totalRow = sheet.getRow(currentRow);
  sheet.mergeCells(`A${currentRow}:I${currentRow}`);
  const totalLabelCell = totalRow.getCell(1);
  totalLabelCell.value = 'Tổng cộng:';
  totalLabelCell.font = boldFont;
  totalLabelCell.alignment = { horizontal: 'right', vertical: 'middle' };
  
  const totalValueCell = totalRow.getCell(10);
  totalValueCell.value = Number(data.declaration.totalAmount);
  totalValueCell.font = boldFont;
  totalValueCell.numFmt = '#,##0';

  for (let i = 1; i <= 11; i++) {
     totalRow.getCell(i).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  }
  currentRow++;

  // 6. Text sum
  sheet.mergeCells(`A${currentRow}:K${currentRow}`);
  const sumTextRow = sheet.getRow(currentRow);
  sumTextRow.getCell(1).value = `Tổng giá trị hàng hóa mua vào: ${numberToVietnameseWords(Number(data.declaration.totalAmount))}`;
  sumTextRow.getCell(1).font = { ...normalFont, italic: true };
  
  currentRow += 2;

  // 7. Signatures
  sheet.mergeCells(`B${currentRow}:D${currentRow}`);
  const preparerTitle = sheet.getCell(`B${currentRow}`);
  preparerTitle.value = 'Người lập bảng kê';
  preparerTitle.font = boldFont;
  preparerTitle.alignment = { horizontal: 'center' };

  sheet.mergeCells(`G${currentRow}:J${currentRow}`);
  const repTitle = sheet.getCell(`G${currentRow}`);
  repTitle.value = 'Giám đốc';
  repTitle.font = boldFont;
  repTitle.alignment = { horizontal: 'center' };

  currentRow++;
  
  sheet.mergeCells(`B${currentRow}:D${currentRow}`);
  const preLabel = sheet.getCell(`B${currentRow}`);
  preLabel.value = '(Ký, họ và tên)';
  preLabel.font = { ...normalFont, italic: true };
  preLabel.alignment = { horizontal: 'center' };

  sheet.mergeCells(`G${currentRow}:J${currentRow}`);
  const repLabel = sheet.getCell(`G${currentRow}`);
  repLabel.value = '(Ký, đóng dấu, họ và tên)';
  repLabel.font = { ...normalFont, italic: true };
  repLabel.alignment = { horizontal: 'center' };

  currentRow += 5; // Space for signatures

  sheet.mergeCells(`B${currentRow}:D${currentRow}`);
  const preparerName = sheet.getCell(`B${currentRow}`);
  preparerName.value = data.declaration.preparedBy;
  preparerName.font = boldFont;
  preparerName.alignment = { horizontal: 'center' };

  sheet.mergeCells(`G${currentRow}:J${currentRow}`);
  const repName = sheet.getCell(`G${currentRow}`);
  repName.value = data.declaration.representative;
  repName.font = boldFont;
  repName.alignment = { horizontal: 'center' };

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as Buffer;
}
