<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Productpos;

class ProductposSeeder extends Seeder
{
    public function run()
    {
        $products = [
            [
                'name' => 'พิซซ่า',
                'price' => 99.00,
                'image' => 'https://cdn.pizzahut.co.th/pizzas-by-size/mixed-deluxe_mde-M-09022024125157.jpg',
                'category' => 'อาหาร',
            ],
            [
                'name' => 'ชาเขียว',
                'price' => 25.00,
                'image' => 'https://www.nescafe.com/th/sites/default/files/2024-08/Green%20tea.png',
                'category' => 'เครื่องดื่ม',
            ],
            [
                'name' => 'เค้กช็อกโกแลต',
                'price' => 80.00,
                'image' => 'https://www.madamemarco.co.th/uploads/products/2015/10/1446091015-84.png',
                'category' => 'ของหวาน',
            ],
        ];

        foreach ($products as $product) {
            Productpos::create($product);
        }
    }
}