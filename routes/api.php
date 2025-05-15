<?php

use App\Models\Product;
use App\Models\Productpos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

//don't edit top detail

Route::get('/product', function () {
    $products = Product::all(); // Fetch all products
    return response()->json($products); // Return as JSON
});

Route::get('/productpos', function () {
    $products = Productpos::all(); // Fetch all products
    return response()->json($products); // Return as JSON
});

