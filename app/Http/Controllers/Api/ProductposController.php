<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Productpos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductposController extends Controller
{
    // แสดงรายการทั้งหมดของสินค้า
    public function index()
    {
        $products = Productpos::all();
        return response()->json($products);
    }

    // แสดงข้อมูลสินค้าตัวเดียว
    public function show($id)
    {
        $product = Productpos::find($id);

        if (!$product) {
            return response()->json(['message' => 'ไม่พบสินค้า'], 404);
        }

        return response()->json($product, 200);
    }

    // เพิ่มสินค้าใหม่
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'image' => 'nullable|image|mimes:jpg,png,jpeg|max:2048',
            'category' => 'required|string|max:255',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = Storage::url($path);
        } else {
            $validated['image'] = $request->input('image', ''); // ใช้ URL เดิมหรือค่าว่าง
        }

        $product = Productpos::create($validated);

        return response()->json(['message' => 'เพิ่มสินค้าสำเร็จ!', 'product' => $product], 201);
    }

    // อัปเดตสินค้าที่มีอยู่
    public function update(Request $request, $id)
    {
        $product = Productpos::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'image' => 'nullable', // Changed from 'image' to 'nullable'
            'category' => 'required|string|max:255',
        ]);

        // Handle image only if provided
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image) {
                Storage::disk('public')->delete(
                    str_replace('/storage/', '', $product->image)
                );
            }

            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = Storage::url($path);
        } else {
            // Keep existing image if not provided
            $validated['image'] = $product->image;
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product
        ]);
    }

    // ลบสินค้าที่มีอยู่
    public function destroy($id)
    {
        $product = Productpos::find($id);

        if (!$product) {
            return response()->json(['message' => 'ไม่พบสินค้า'], 404);
        }

        // ลบรูปภาพถ้ามี
        if ($product->image) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $product->image));
        }

        $product->delete();

        return response()->json(['message' => 'ลบสินค้าเรียบร้อย!']);
    }
}
