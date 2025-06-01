<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\MaintenanceRequest;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::with('request')->get();
        return response()->json($invoices);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'request_id' => 'required|exists:maintenance_requests,id',
            'amount' => 'required|numeric|min:0',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'items' => 'required|array',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        // คำนวณยอดรวมจากรายการ
        $amount = collect($validated['items'])->sum(function ($item) {
            return $item['quantity'] * $item['unit_price'];
        });

        $invoiceNo = 'INV-' . date('Ymd') . '-' . str_pad(Invoice::count() + 1, 4, '0', STR_PAD_LEFT);

        $invoice = Invoice::create([
            'request_id' => $validated['request_id'],
            'amount' => $amount,
            'invoice_no' => $invoiceNo,
            'issue_date' => $validated['issue_date'],
            'due_date' => $validated['due_date'],
            'items' => json_encode($validated['items']),
        ]);

        return response()->json(['message' => 'Invoice created successfully', 'invoice' => $invoice], 201);
    }

    public function update(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);

        $validated = $request->validate([
            'request_id' => 'sometimes|exists:maintenance_requests,id',
            'amount' => 'sometimes|numeric|min:0',
            'issue_date' => 'sometimes|date',
            'due_date' => 'sometimes|date|after_or_equal:issue_date',
            'items' => 'sometimes|array',
            'items.*.description' => 'sometimes|string',
            'items.*.quantity' => 'sometimes|integer|min:1',
            'items.*.unit_price' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:unpaid,paid,cancelled',
        ]);

        if (isset($validated['items'])) {
            $validated['amount'] = collect($validated['items'])->sum(function ($item) {
                return $item['quantity'] * $item['unit_price'];
            });
            $validated['items'] = json_encode($validated['items']);
        }

        $invoice->update($validated);

        return response()->json(['message' => 'Invoice updated successfully', 'invoice' => $invoice]);
    }

    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->delete();

        return response()->json(['message' => 'Invoice deleted successfully']);
    }

    public function print($id)
    {
        $invoice = Invoice::with('request')->findOrFail($id);
        return view('invoices.print', compact('invoice'));
    }
}
