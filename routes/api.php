<?php

use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\MaintenanceRequestController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductposController;
use App\Models\Product;
use App\Models\Productpos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/product', function () {
    $products = Product::all();
    return response()->json($products);
});

Route::get('/productpos', function () {
    $products = Productpos::all();
    return response()->json($products);
});

Route::prefix('maintenance')->group(function () {
    Route::apiResource('requests', MaintenanceRequestController::class);
    Route::get('technicians', [MaintenanceRequestController::class, 'technicians']);
    Route::apiResource('invoices', InvoiceController::class);
    Route::get('invoices/{id}/print', [InvoiceController::class, 'print'])->name('invoices.print');
});

Route::apiResource('/product', ProductController::class);
Route::apiResource('productpos', ProductposController::class);