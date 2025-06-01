<!-- filepath: resources/views/invoices/print.blade.php -->
<!DOCTYPE html>
<html>

<head>
    <title>ใบแจ้งหนี้ {{ $invoice->invoice_no }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f6f8fa;
        }

        .container {
            max-width: 700px;
            margin: 20px auto 20px auto;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
            padding: 20px 32px 32px 32px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .customer-info {
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }

        .text-right {
            text-align: right;
        }

        .total {
            font-weight: bold;
            font-size: 1.2em;
        }

        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 0.9em;
            color: #666;
        }

        @page {
            size: A4;
            margin: 10mm;
        }

        @media print {
            body {
                padding: 0;
                margin: 0;
                background: #fff;
            }

            .no-print {
                display: none;
            }

            .container {
                box-shadow: none;
                border-radius: 0;
                margin: 0;
                padding: 0 0 0 0;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>ใบแจ้งหนี้</h1>
            <h2>{{ $invoice->invoice_no }}</h2>
        </div>

        <div class="invoice-info">
            <div>
                <p><strong>วันที่ออก:</strong> {{ date('d/m/Y', strtotime($invoice->issue_date)) }}</p>
                <p><strong>ครบกำหนด:</strong> {{ date('d/m/Y', strtotime($invoice->due_date)) }}</p>
            </div>
            <div>
                <p><strong>หมายเลขคำขอ:</strong> {{ $invoice->request->request_no }}</p>
                <p><strong>สถานะ:</strong>
                    @if ($invoice->status === 'paid')
                        <span style="color: green;">ชำระแล้ว</span>
                    @elseif($invoice->status === 'cancelled')
                        <span style="color: red;">ยกเลิก</span>
                    @else
                        <span style="color: orange;">ยังไม่ชำระ</span>
                    @endif
                </p>
            </div>
        </div>

        <div class="customer-info">            
                <p><strong>ชื่อลูกค้า:</strong> {{ $invoice->request->customer_name }}</p>
                <p><strong>โทรศัพท์:</strong> {{ $invoice->request->customer_phone }}</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>รายการ</th>
                    <th width="15%">จำนวน</th>
                    <th width="20%">ราคาต่อหน่วย</th>
                    <th width="20%">จำนวนเงิน</th>
                </tr>
            </thead>
            <tbody>
                @foreach (json_decode($invoice->items, true) as $item)
                    <tr>
                        <td>{{ $item['description'] }}</td>
                        <td>{{ $item['quantity'] }}</td>
                        <td class="text-right">{{ number_format($item['unit_price'], 2) }}</td>
                        <td class="text-right">{{ number_format($item['quantity'] * $item['unit_price'], 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3" class="text-right total">รวม</td>
                    <td class="text-right total">{{ number_format($invoice->amount, 2) }}</td>
                </tr>
            </tfoot>
        </table>

        <div class="footer">
            <p>ขอบคุณที่ใช้บริการ</p>
            <p>หากมีข้อสงสัยกรุณาติดต่อ 02-123-4567</p>
        </div>

        <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()"
                style="padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer;">
                พิมพ์ใบแจ้งหนี้
            </button>
        </div>
    </div>
</body>

</html>
