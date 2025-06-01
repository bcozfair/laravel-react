<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceRequest;
use App\Models\MaintenanceTechnician;
use Illuminate\Http\Request;

class MaintenanceRequestController extends Controller
{
    public function index()
    {
        $requests = MaintenanceRequest::with('technician')->get();
        return response()->json($requests);
    }

    public function technicians()
    {
        $technicians = MaintenanceTechnician::all();
        return response()->json($technicians);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'description' => 'required|string',
            'category' => 'required|string|max:255',
            'technician_id' => 'nullable|exists:maintenance_technicians,id',
        ]);

        // สร้างหมายเลขคำขอ
        $requestNo = 'REQ-' . date('Ymd') . '-' . str_pad(MaintenanceRequest::count() + 1, 4, '0', STR_PAD_LEFT);

        $maintenanceRequest = MaintenanceRequest::create([
            'request_no' => $requestNo,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'description' => $validated['description'],
            'category' => $validated['category'],
            'technician_id' => $validated['technician_id'],
        ]);

        return response()->json([
            'message' => 'Request created successfully',
            'request' => $maintenanceRequest
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $maintenanceRequest = MaintenanceRequest::findOrFail($id);
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'status' => 'required|in:pending,in_progress,completed',
            'technician_id' => 'nullable|exists:maintenance_technicians,id',
        ]);

        $maintenanceRequest->update($validated);
        return response()->json(['message' => 'Request updated successfully', 'request' => $maintenanceRequest]);
    }

    public function destroy($id)
    {
        $maintenanceRequest = MaintenanceRequest::findOrFail($id);
        $maintenanceRequest->delete();
        return response()->json(['message' => 'Request deleted successfully']);
    }
}
